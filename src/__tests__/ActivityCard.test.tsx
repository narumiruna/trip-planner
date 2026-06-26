/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityCard from '@/components/ActivityCard';

const baseActivity = {
  id: 'activity-1',
  type: 'food',
  title: 'Le Petit Bistro',
  description: 'A cozy French bistro in the heart of Paris.',
  reason: 'Matches your love for French cuisine.',
  lat: 48.865,
  lng: 2.321,
  city: 'Paris',
  suggestedTime: 'dinner',
  durationMinutes: 90,
  status: 'pending',
};

describe('ActivityCard', () => {
  const onApprove = jest.fn();
  const onReject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the activity title, description, and reason', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText('Le Petit Bistro')).toBeInTheDocument();
    expect(screen.getByText('A cozy French bistro in the heart of Paris.')).toBeInTheDocument();
    expect(screen.getByText(/Matches your love for French cuisine/)).toBeInTheDocument();
  });

  it('keeps repeated meta labels out of the activity card', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.queryByText('Planning brief')).not.toBeInTheDocument();
    expect(screen.queryByText('Experience')).not.toBeInTheDocument();
    expect(screen.queryByText('Why it fits')).not.toBeInTheDocument();
    expect(screen.queryByText('Estimated stay')).not.toBeInTheDocument();
  });

  it('renders the city and suggested time', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText(/Paris · 🌙/)).toBeInTheDocument();
    expect(screen.getByText(/晚餐/)).toBeInTheDocument();
  });

  it('renders duration when present', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText(/90 分鐘/)).toBeInTheDocument();
  });

  it('does not render duration when durationMinutes is null', () => {
    const activity = { ...baseActivity, durationMinutes: null };
    render(<ActivityCard activity={activity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.queryByText(/分鐘/)).not.toBeInTheDocument();
  });

  it('renders a Google Maps link using activity title and city', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    const link = screen.getByRole('link', { name: /google maps/i });
    expect(link).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=Le%20Petit%20Bistro%2C%20Paris');
  });

  it('falls back to coordinates for Google Maps link when title and city are blank', () => {
    const activity = { ...baseActivity, title: '   ', city: '   ' };
    render(<ActivityCard activity={activity} onApprove={onApprove} onReject={onReject} />);
    const link = screen.getByRole('link', { name: /google maps/i });
    expect(link).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=48.865%2C2.321');
  });

  it('shows approve and reject buttons when status is pending', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByRole('button', { name: /核准/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /排除/i })).toBeInTheDocument();
  });

  it('shows one itinerary-focused primary action when status is approved', async () => {
    const user = userEvent.setup();
    const onOpenItinerary = jest.fn();
    const activity = { ...baseActivity, status: 'approved' };
    render(<ActivityCard activity={activity} onApprove={onApprove} onReject={onReject} onOpenItinerary={onOpenItinerary} />);
    expect(screen.queryByRole('button', { name: /核准/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /排除/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /排進行程/i }));
    expect(onOpenItinerary).toHaveBeenCalledTimes(1);
  });

  it('does not show action buttons when status is rejected', () => {
    const activity = { ...baseActivity, status: 'rejected' };
    render(<ActivityCard activity={activity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.queryByRole('button', { name: /核准/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /排除/i })).not.toBeInTheDocument();
  });

  it('calls onApprove with the activity id when approve is clicked', async () => {
    const user = userEvent.setup();
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    await user.click(screen.getByRole('button', { name: /核准/i }));
    expect(onApprove).toHaveBeenCalledWith('activity-1');
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('calls onReject with the activity id when reject is clicked', async () => {
    const user = userEvent.setup();
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    await user.click(screen.getByRole('button', { name: /排除/i }));
    expect(onReject).toHaveBeenCalledWith('activity-1');
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('renders localized status text', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText('待審核')).toBeInTheDocument();
  });

  it('shows approved status with a subtle dot', () => {
    const activity = { ...baseActivity, status: 'approved' };
    render(<ActivityCard activity={activity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText('已核准')).toBeInTheDocument();
  });

  it('shows rejected status', () => {
    const activity = { ...baseActivity, status: 'rejected' };
    render(<ActivityCard activity={activity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText('已排除')).toBeInTheDocument();
  });

  it('renders type icons', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText('🍽️')).toBeInTheDocument();
    render(<ActivityCard activity={{ ...baseActivity, id: 'activity-2', type: 'place' }} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText('🏛️')).toBeInTheDocument();
    render(<ActivityCard activity={{ ...baseActivity, id: 'activity-3', type: 'hotel' }} onApprove={onApprove} onReject={onReject} />);
    expect(screen.getByText('🏨')).toBeInTheDocument();
  });

  it('does not render a delete button when onDelete is not provided', () => {
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} />);
    expect(screen.queryByRole('button', { name: /刪除活動/i })).not.toBeInTheDocument();
  });

  it('calls onDelete with the activity id when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<ActivityCard activity={baseActivity} onApprove={onApprove} onReject={onReject} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /刪除活動/i }));
    expect(onDelete).toHaveBeenCalledWith('activity-1');
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
