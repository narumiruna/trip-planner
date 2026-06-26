/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripDetailPage from '@/app/trips/[id]/page';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'trip-1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/ActivityCard', () =>
  function MockActivityCard({ activity }: { activity: { title: string; status: string } }) {
    return <div data-testid="activity-card" data-status={activity.status}>{activity.title}</div>;
  }
);
jest.mock('@/components/ItineraryView', () => function MockItineraryView() {
  return <div data-testid="itinerary-view" />;
});
jest.mock('@/components/ConfirmDialog', () => function MockConfirmDialog() {
  return null;
});
jest.mock('@/components/MapView', () => function MockMapView() {
  return <div data-testid="map-view" />;
});
jest.mock('@/components/GoogleMapView', () => function MockGoogleMapView() {
  return <div data-testid="google-map-view" />;
});

const TRIP_RESPONSE = {
  id: 'trip-1',
  name: 'Paris Trip',
  cities: '["Paris"]',
  createdAt: '2026-03-24T00:00:00.000Z',
  currentRole: 'owner',
};

const PENDING_ACTIVITIES = [
  {
    id: 'a-1',
    type: 'place',
    title: 'Louvre Museum',
    description: 'Famous museum',
    reason: 'Must-see',
    lat: 48.86,
    lng: 2.33,
    city: 'Paris',
    suggestedTime: 'morning',
    durationMinutes: 120,
    status: 'pending',
  },
  {
    id: 'a-2',
    type: 'food',
    title: 'Café de Flore',
    description: 'Iconic café',
    reason: 'Classic Paris',
    lat: 48.85,
    lng: 2.33,
    city: 'Paris',
    suggestedTime: 'lunch',
    durationMinutes: 60,
    status: 'pending',
  },
];

function makeBaseFetchMock(
  activitiesOverride = PENDING_ACTIVITIES,
  tripOverride: Record<string, unknown> = {},
  itineraryOverride: unknown[] = []
) {
  return jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';

    if (url === '/api/trips/trip-1' && method === 'GET') {
      return { ok: true, status: 200, json: async () => ({ ...TRIP_RESPONSE, ...tripOverride }) } as Response;
    }
    if (url.startsWith('/api/trips/trip-1/activities?') && method === 'GET') {
      return { ok: true, status: 200, json: async () => activitiesOverride } as Response;
    }
    if (url === '/api/trips/trip-1/itinerary' && method === 'GET') {
      return { ok: true, status: 200, json: async () => itineraryOverride } as Response;
    }
    throw new Error(`Unexpected fetch: ${method} ${url}`);
  });
}

describe('Trip detail — Approve All', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('groups trip primary actions into a command strip', async () => {
    global.fetch = makeBaseFetchMock() as unknown as typeof fetch;

    render(<TripDetailPage />);

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    const strip = screen.getByTestId('trip-command-strip');
    expect(within(strip).getByRole('button', { name: /產生靈感/ })).toBeInTheDocument();
    expect(within(strip).getByRole('button', { name: /全部核准（2）/ })).toBeInTheDocument();
    expect(within(strip).getByRole('button', { name: /AI 整理行程/ })).toBeInTheDocument();
    expect(within(strip).getByRole('button', { name: /分享/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /開啟行程/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /檢視靈感/ })).not.toBeInTheDocument();
  });

  it('does not show approve-all button when there are no pending activities', async () => {
    const approvedActivities = PENDING_ACTIVITIES.map((a) => ({ ...a, status: 'approved' }));
    global.fetch = makeBaseFetchMock(approvedActivities) as unknown as typeof fetch;

    render(<TripDetailPage />);

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: /全部核准/ })).not.toBeInTheDocument();
  });

  it('shows a pending count badge on the activities tab', async () => {
    global.fetch = makeBaseFetchMock() as unknown as typeof fetch;

    render(<TripDetailPage />);

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    // The badge should be scoped within the activities tab element.
    expect(screen.getByTestId('activities-tab-badge')).toHaveTextContent('2');
  });

  it('shows concierge readiness guidance for the trip dossier', async () => {
    global.fetch = makeBaseFetchMock() as unknown as typeof fetch;

    render(<TripDetailPage />);

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    const card = screen.getByTestId('readiness-card');
    expect(card).toHaveTextContent('補上日期或天數，行程節奏才有可信基準。');
    expect(card).toHaveTextContent('2 個靈感');
    expect(card).toHaveTextContent('0 已核准');
  });

  it('uses stronger todo styling and limits missing readiness items below 50%', async () => {
    global.fetch = makeBaseFetchMock() as unknown as typeof fetch;

    render(<TripDetailPage />);

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    const card = screen.getByTestId('readiness-card');
    expect(card).toHaveTextContent('簡報中');
    expect(card).toHaveTextContent('需補：補上日期或天數、核准合適靈感');
    expect(card).not.toHaveTextContent('排進每日行程');
  });

  it('shows progress and only two missing readiness items between 50 and 99%', async () => {
    const approvedActivities = PENDING_ACTIVITIES.map((a) => ({ ...a, status: 'approved' }));
    global.fetch = makeBaseFetchMock(
      approvedActivities,
      { startDate: '2026-06-01', durationDays: 3 }
    ) as unknown as typeof fetch;

    render(<TripDetailPage />);

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    const card = screen.getByTestId('readiness-card');
    expect(card).toHaveTextContent('60%');
    expect(card).toHaveTextContent('需補：排進每日行程、確認地圖路線');
    expect(card).not.toHaveTextContent('建立分享連結');
  });

  it('turns 100% readiness into an inline share action bar', async () => {
    const approvedActivities = PENDING_ACTIVITIES.map((a) => ({ ...a, status: 'approved' }));
    const itineraryItems = approvedActivities.map((activity, index) => ({
      id: `i-${index + 1}`,
      day: 1,
      timeBlock: activity.suggestedTime,
      order: index,
      activity,
    }));
    global.fetch = makeBaseFetchMock(
      approvedActivities,
      { startDate: '2026-06-01', durationDays: 3, shareToken: 'share-token' },
      itineraryItems
    ) as unknown as typeof fetch;

    render(<TripDetailPage />);

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    const card = screen.getByTestId('readiness-card');
    expect(card).toHaveTextContent('已備好可分享');
    expect(within(card).getByRole('button', { name: '複製連結' })).toBeInTheDocument();
    expect(screen.queryByTestId('planning-pipeline')).not.toBeInTheDocument();
  });

  it('folds planning counts into readiness card and keeps sharing controls in trip settings', async () => {
    global.fetch = makeBaseFetchMock() as unknown as typeof fetch;

    render(<TripDetailPage />);

    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    const card = screen.getByTestId('readiness-card');
    expect(card).toHaveTextContent('2 個靈感');
    expect(card).toHaveTextContent('0 已核准');
    expect(card).toHaveTextContent('0 已排程');
    expect(card).toHaveTextContent('0 已上圖');
    expect(screen.queryByTestId('planning-pipeline')).not.toBeInTheDocument();
    expect(screen.queryByText('Curated ideas')).not.toBeInTheDocument();

    expect(screen.queryByPlaceholderText(/輸入 Email 分享/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '旅程設定' }));
    expect(screen.getByPlaceholderText(/輸入 Email 分享/)).toBeInTheDocument();
  });

  it('calls approve-all endpoint and updates state on click', async () => {
    const approvedActivities = PENDING_ACTIVITIES.map((a) => ({ ...a, status: 'approved' }));
    const newItineraryItems = approvedActivities.map((a, i) => ({
      id: `ii-${i + 1}`,
      day: i + 1,
      timeBlock: a.suggestedTime,
      order: 0,
      activity: a,
    }));

    const fetchMock = makeBaseFetchMock();
    // Override to handle approve-all POST
    const originalImpl = fetchMock.getMockImplementation();
    if (!originalImpl) throw new Error('Expected base fetch implementation');
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url === '/api/trips/trip-1/activities/approve-all' && method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ activities: approvedActivities, itineraryItems: newItineraryItems }),
        } as Response;
      }
      return originalImpl(input, init);
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<TripDetailPage />);

    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText('Paris Trip')).toBeInTheDocument());

    const approveAllBtn = screen.getByRole('button', { name: /全部核准（2）/ });
    await user.click(approveAllBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/trips/trip-1/activities/approve-all',
        expect.objectContaining({ method: 'POST' })
      );
    });

    // After approve all, button should disappear (no more pending)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /全部核准/ })).not.toBeInTheDocument();
    });
  });
});
