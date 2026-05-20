/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripCard from '@/components/TripCard';

const baseTrip = {
  id: 'trip-1',
  name: 'Summer Vacation',
  cities: JSON.stringify(['Paris', 'Tokyo']),
  createdAt: '2024-06-15T00:00:00.000Z',
  startDate: null,
  durationDays: null,
};

describe('TripCard', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders the trip name and destination badges', () => {
    render(<TripCard trip={baseTrip} />);
    expect(screen.getByText('Summer Vacation')).toBeInTheDocument();
    expect(screen.getByText(/Paris/)).toBeInTheDocument();
    expect(screen.getByText(/Tokyo/)).toBeInTheDocument();
  });

  it('renders a truthful created date instead of unsupported last-edited data', () => {
    render(<TripCard trip={baseTrip} />);
    expect(screen.getByText(/建立於/)).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('renders schedule information prominently', () => {
    render(<TripCard trip={{ ...baseTrip, startDate: '2026-04-01', durationDays: 7 }} />);
    expect(screen.getByText('2026-04-01')).toBeInTheDocument();
    expect(screen.getByText('7 天')).toBeInTheDocument();
  });

  it('uses a progress bar based on itinerary items over total activities', () => {
    render(<TripCard trip={{ ...baseTrip, counts: { activitiesCount: 5, itineraryItemsCount: 3 } }} />);
    expect(screen.getByText('3 / 5 已排程')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Summer Vacation 規劃進度' })).toHaveAttribute('aria-valuenow', '60');
  });

  it('renders quick actions without making the whole card a link', () => {
    render(<TripCard trip={{ ...baseTrip, counts: { activitiesCount: 5, itineraryItemsCount: 3 } }} />);
    expect(screen.getByRole('link', { name: '開啟 Summer Vacation' })).toHaveAttribute('href', '/trips/trip-1');
    expect(screen.getByRole('button', { name: '複製 Summer Vacation 連結' })).toBeInTheDocument();
    expect(screen.getByText('更多')).toBeInTheDocument();
  });

  it('calls onDelete from the card action menu', async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();
    render(<TripCard trip={baseTrip} onDelete={onDelete} />);

    await user.click(screen.getByText('更多'));
    await user.click(screen.getByRole('button', { name: '刪除 Summer Vacation' }));

    expect(onDelete).toHaveBeenCalledWith('trip-1');
  });

  it('does not render brand eyebrow copy', () => {
    render(<TripCard trip={baseTrip} />);
    expect(screen.queryByText('Private dossier')).not.toBeInTheDocument();
  });
});
