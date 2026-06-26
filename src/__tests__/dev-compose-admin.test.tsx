/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { render, screen, within } from '@testing-library/react';
import AuthPage from '@/app/auth/page';

const mockUpsert = jest.fn();
const mockDisconnect = jest.fn();
const mockPrismaClient = jest.fn(() => ({ user: { upsert: mockUpsert }, $disconnect: mockDisconnect }));
const mockPrismaBetterSqlite3 = jest.fn((options) => ({ options }));

jest.mock('@prisma/client', () => ({ PrismaClient: mockPrismaClient }));
jest.mock('@prisma/adapter-better-sqlite3', () => ({ PrismaBetterSqlite3: mockPrismaBetterSqlite3 }));

const root = process.cwd();

describe('dev compose admin environment', () => {
  const originalEmail = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL;
  const originalPassword = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD;

  afterEach(() => {
    if (originalEmail === undefined) {
      delete process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL;
    } else {
      process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL = originalEmail;
    }
    if (originalPassword === undefined) {
      delete process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD;
    } else {
      process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD = originalPassword;
    }
  });

  it('wires just dev up to the dev compose file', () => {
    const justfile = fs.readFileSync(path.join(root, 'justfile'), 'utf8');
    const compose = fs.readFileSync(path.join(root, 'compose.dev.yml'), 'utf8');
    const dockerfile = fs.readFileSync(path.join(root, 'Dockerfile'), 'utf8');

    expect(justfile).toContain('docker compose -f compose.dev.yml up --build');
    expect(compose).toContain('node scripts/seed-dev-admin.cjs');
    expect(compose).toContain('user: node');
    expect(dockerfile).toContain('chown -R node:node /app/node_modules /app/data');
    expect(compose).not.toContain('npm install');
    expect(compose).toContain('npm run dev -- --hostname 0.0.0.0');
  });

  it('normalizes dev admin credentials for seeding', () => {
    const { normalizeDevAdminCredentials } = jest.requireActual('../../scripts/seed-dev-admin.cjs') as {
      normalizeDevAdminCredentials: (env: Record<string, string | undefined>) => { email: string; password: string; name: string } | null;
    };

    expect(normalizeDevAdminCredentials({
      DEV_ADMIN_EMAIL: ' Admin@Example.Test ',
      DEV_ADMIN_PASSWORD: 'dev-password123',
      DEV_ADMIN_NAME: ' Dev Admin ',
    })).toEqual({
      email: 'admin@example.test',
      password: 'dev-password123',
      name: 'Dev Admin',
    });
  });

  it('uses the SQLite adapter when seeding the dev admin', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    mockUpsert.mockResolvedValue({ id: 'u-1', email: 'admin@example.test', name: 'Dev Admin' });
    const { seedDevAdmin } = jest.requireActual('../../scripts/seed-dev-admin.cjs') as {
      seedDevAdmin: (env: Record<string, string | undefined>) => Promise<unknown>;
    };

    try {
      await seedDevAdmin({
        ENABLE_DEV_ADMIN_SEED: 'true',
        DEV_ADMIN_EMAIL: 'admin@example.test',
        DEV_ADMIN_PASSWORD: 'dev-password123',
        DATABASE_URL: 'file:/app/data/dev.db',
      });
    } finally {
      consoleLog.mockRestore();
    }

    expect(mockPrismaBetterSqlite3).toHaveBeenCalledWith({ url: '/app/data/dev.db' });
    expect(mockPrismaClient).toHaveBeenCalledWith({ adapter: { options: { url: '/app/data/dev.db' } } });
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('prefills auth form with dev admin credentials from public env', () => {
    process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL = 'admin@example.test';
    process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD = 'dev-password123';

    render(<AuthPage />);

    const primaryPanel = screen.getByTestId('auth-primary-panel');
    expect(within(primaryPanel).getByRole('heading', { name: '登入' })).toBeInTheDocument();
    expect(within(primaryPanel).getByDisplayValue('admin@example.test')).toBeInTheDocument();
    expect(within(primaryPanel).getByDisplayValue('dev-password123')).toBeInTheDocument();
    expect(screen.getByTestId('auth-support-note')).toHaveTextContent('開發帳號已帶入');
    expect(screen.queryByText(/Continue building travel plans/i)).not.toBeInTheDocument();
  });
});
