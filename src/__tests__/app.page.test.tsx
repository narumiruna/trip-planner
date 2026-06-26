/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const meResponse = { id: 'user-1', email: 'narumi@example.com', name: 'narumi' };

function installFetchMock(tripsPayload: unknown = []) {
  const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';

    if (url === '/api/me' && method === 'GET') {
      return { status: 200, ok: true, json: async () => meResponse } as Response;
    }

    if (url === '/api/trips' && method === 'GET') {
      return { status: 200, ok: true, json: async () => tripsPayload } as Response;
    }

    if (url === '/api/trips' && method === 'POST') {
      return {
        status: 201,
        ok: true,
        json: async () => ({
          id: 'new-trip-1',
          name: 'Japan Trip',
          cities: '["Tokyo"]',
          createdAt: '2026-04-30T00:00:00.000Z',
        }),
      } as Response;
    }

    throw new Error(`Unexpected fetch: ${method} ${url}`);
  });

  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('Home page', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('does not crash when /api/trips returns a non-array payload', async () => {
    installFetchMock({ error: 'Unauthorized' });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('還沒有旅程')).toBeInTheDocument();
    });
    expect(screen.queryByText('我的旅程')).toBeInTheDocument();
  });

  it('keeps the empty dashboard focused on one primary creation action', async () => {
    installFetchMock([]);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('還沒有旅程')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /新增旅程/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /建立第一個旅程/i })).toBeInTheDocument();
  });

  it('puts the user portfolio first instead of marketing copy', async () => {
    installFetchMock([
      {
        id: 'trip-1',
        name: '大阪市',
        cities: '["Osaka", "Kyoto"]',
        createdAt: '2026-05-01T00:00:00.000Z',
        startDate: null,
        durationDays: null,
        _count: { activities: 4, itineraryItems: 4 },
      },
      {
        id: 'trip-2',
        name: 'Taipei Weekend',
        cities: '["Taipei"]',
        createdAt: '2026-05-02T00:00:00.000Z',
        startDate: '2026-06-01',
        durationDays: 3,
        _count: { activities: 6, itineraryItems: 3 },
      },
    ]);

    render(<Home />);

    expect(await screen.findByText('narumi，下一站？')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /新增旅程/i })).toBeInTheDocument();
    expect(screen.getByText('我的旅程')).toBeInTheDocument();
    expect(screen.getAllByText('大阪市').length).toBeGreaterThan(0);
    expect(screen.getByText('Taipei Weekend')).toBeInTheDocument();
    expect(screen.queryByText('Atelier standards')).not.toBeInTheDocument();
    expect(screen.queryByText('Concierge craft rules behind every trip')).not.toBeInTheDocument();
    expect(screen.queryByText('Map-ready routes')).not.toBeInTheDocument();
    expect(screen.queryByText('Trip Planner Atelier')).not.toBeInTheDocument();
    expect(screen.queryByText('私人旅行工作台')).not.toBeInTheDocument();
  });

  it('surfaces the concierge next move as an inline banner', async () => {
    installFetchMock([
      {
        id: 'trip-1',
        name: 'Paris Atelier',
        cities: '["Paris"]',
        createdAt: '2026-05-01T00:00:00.000Z',
        startDate: null,
        durationDays: null,
        _count: { activities: 4, itineraryItems: 4 },
      },
    ]);

    render(<Home />);

    const banner = await screen.findByTestId('next-move-banner');
    expect(banner).toHaveTextContent('下一步');
    expect(banner).toHaveTextContent('設定旅程日期');
    expect(banner).toHaveTextContent('Paris Atelier');
    expect(within(banner).getByRole('link', { name: /開啟/i })).toHaveAttribute('href', '/trips/trip-1');
  });

  it('navigates to the new trip detail page after successful creation', async () => {
    installFetchMock([]);

    render(<Home />);

    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText('還沒有旅程')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /建立第一個旅程/i }));
    await user.type(screen.getByLabelText('旅程名稱'), 'Japan Trip');
    await user.type(screen.getByLabelText('城市（以逗號分隔）'), 'Tokyo');
    await user.click(screen.getByRole('button', { name: /建立旅程/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/trips/new-trip-1');
    });
  });
});
