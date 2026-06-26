/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripDetailPage from '@/app/trips/[id]/page';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'trip-1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/ActivityCard', () => function MockActivityCard({ activity, onReject }: { activity: { id: string; title: string }; onReject: (id: string) => void }) {
  return <button onClick={() => onReject(activity.id)}>Reject {activity.title}</button>;
});

const mockItineraryView = jest.fn((props: { items: unknown[] }) => (
  <div data-testid="itinerary-count">{props.items.length}</div>
));
jest.mock('@/components/ItineraryView', () => ({
  __esModule: true,
  default: (props: { items: unknown[] }) => mockItineraryView(props),
}));
jest.mock('@/components/ConfirmDialog', () => function MockConfirmDialog() {
  return null;
});
jest.mock('@/components/MapView', () => function MockMapView() {
  return <div data-testid="map-view" />;
});
jest.mock('@/components/GoogleMapView', () => function MockGoogleMapView() {
  return <div data-testid="google-map-view" />;
});

describe('Trip detail reject itinerary cleanup', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    mockItineraryView.mockClear();
  });

  it('removes a rejected activity from local itinerary state', async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url === '/api/trips/trip-1' && method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'trip-1',
            name: 'Japan Trip',
            cities: '["Tokyo"]',
            createdAt: '2026-03-24T00:00:00.000Z',
            currentRole: 'owner',
          }),
        } as Response;
      }

      if (url.startsWith('/api/trips/trip-1/activities?') && method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => ([
            {
              id: 'p-1',
              type: 'place',
              title: 'Senso-ji',
              description: 'Temple',
              reason: '',
              lat: 35.7148,
              lng: 139.7967,
              city: 'Tokyo',
              suggestedTime: 'morning',
              durationMinutes: 90,
              status: 'approved',
            },
          ]),
        } as Response;
      }

      if (url === '/api/trips/trip-1/itinerary' && method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => ([
            {
              id: 'i-1',
              day: 1,
              timeBlock: 'morning',
              order: 0,
              activity: {
                id: 'p-1',
                type: 'place',
                title: 'Senso-ji',
                description: 'Temple',
                reason: '',
                lat: 35.7148,
                lng: 139.7967,
                city: 'Tokyo',
                suggestedTime: 'morning',
                durationMinutes: 90,
                status: 'approved',
              },
            },
          ]),
        } as Response;
      }

      if (url === '/api/activities/p-1/reject' && method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'p-1', status: 'rejected' }),
        } as Response;
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<TripDetailPage />);

    await waitFor(() => expect(screen.getByText('Japan Trip')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /^行程$/ }));
    await waitFor(() => expect(screen.getByTestId('itinerary-count')).toHaveTextContent('1'));

    await userEvent.click(screen.getByRole('button', { name: /^靈感$/ }));
    await userEvent.click(screen.getByRole('button', { name: /Reject Senso-ji/ }));
    await userEvent.click(screen.getByRole('button', { name: /^行程$/ }));

    await waitFor(() => expect(screen.getByTestId('itinerary-count')).toHaveTextContent('0'));
  });
});
