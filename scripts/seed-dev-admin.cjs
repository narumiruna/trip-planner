const { randomBytes, scrypt: scryptCallback } = require('crypto');
const path = require('path');
const { promisify } = require('util');

const scrypt = promisify(scryptCallback);
const DEFAULT_EMAIL = 'admin@example.test';
const DEFAULT_PASSWORD = 'dev-password123';
const DEFAULT_NAME = 'Dev Admin';

function normalizeDevAdminCredentials(env = process.env) {
  const email = (env.DEV_ADMIN_EMAIL || env.NEXT_PUBLIC_DEV_ADMIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const password = env.DEV_ADMIN_PASSWORD || env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const name = (env.DEV_ADMIN_NAME || DEFAULT_NAME).trim() || DEFAULT_NAME;
  if (!email || !password) return null;
  return { email, password, name };
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString('hex')}`;
}

function resolveDatabasePath(databaseUrl = 'file:./dev.db') {
  if (databaseUrl.startsWith('file:')) {
    const [rawPath] = databaseUrl.slice('file:'.length).split('?');
    if (!rawPath) throw new Error('DATABASE_URL must include a SQLite file path.');
    return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
  }
  return path.isAbsolute(databaseUrl) ? databaseUrl : path.resolve(process.cwd(), databaseUrl);
}

async function seedDevAdmin(env = process.env) {
  if (env.ENABLE_DEV_ADMIN_SEED !== 'true') {
    console.log('Skipping dev admin seed. Set ENABLE_DEV_ADMIN_SEED=true to enable it.');
    return null;
  }

  const credentials = normalizeDevAdminCredentials(env);
  if (!credentials) {
    console.log('Skipping dev admin seed. Missing credentials.');
    return null;
  }
  if (credentials.password.length < 8) {
    throw new Error('DEV_ADMIN_PASSWORD must be at least 8 characters.');
  }

  const { PrismaClient } = require('@prisma/client');
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabasePath(env.DATABASE_URL) });
  const prisma = new PrismaClient({ adapter });
  try {
    const passwordHash = await hashPassword(credentials.password);
    const user = await prisma.user.upsert({
      where: { email: credentials.email },
      update: { name: credentials.name, passwordHash },
      create: {
        email: credentials.email,
        name: credentials.name,
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });
    console.log(`Dev admin ready: ${user.email}`);
    return user;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDevAdmin().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { normalizeDevAdminCredentials, hashPassword, resolveDatabasePath, seedDevAdmin };
