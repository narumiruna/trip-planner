jest.mock('@/lib/prisma', () => ({
  prisma: {
    trip: { findUnique: jest.fn() },
    tripMember: { findMany: jest.fn() },
    preference: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    itineraryItem: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/llm', () => ({
  fillActivityDetails: jest.fn(),
  generateChatActionPlan: jest.fn(),
  generateActivities: jest.fn(),
  organizeItinerary: jest.fn(),
}));

jest.mock('@/lib/geocoding', () => ({
  geocodeWithGoogleMaps: jest.fn(),
}));

import { executeTripActions } from '@/lib/chatbot';
import { prisma } from '@/lib/prisma';
import { generateActivities, organizeItinerary } from '@/lib/llm';
import { geocodeWithGoogleMaps } from '@/lib/geocoding';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGenerateActivities = generateActivities as jest.Mock;
const mockOrganizeItinerary = organizeItinerary as jest.Mock;
const mockGeocodeWithGoogleMaps = geocodeWithGoogleMaps as jest.Mock;

describe('executeTripActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockPrisma.trip.findUnique as jest.Mock).mockResolvedValue({ id: 'trip-1' });
    (mockPrisma.tripMember.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.preference.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.preference.findFirst as jest.Mock).mockResolvedValue({ id: 'pref-1', userId: 'u-1' });
    (mockPrisma.preference.update as jest.Mock).mockResolvedValue({ id: 'pref-1' });
    (mockPrisma.preference.create as jest.Mock).mockResolvedValue({ id: 'pref-1' });
    (mockPrisma.activity.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue({ id: 'a-1', tripId: 'trip-1' });
    (mockPrisma.activity.create as jest.Mock).mockResolvedValue({ id: 'a-1' });
    (mockPrisma.activity.delete as jest.Mock).mockResolvedValue({ id: 'a-1' });
    (mockPrisma.itineraryItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    (mockPrisma.itineraryItem.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.itineraryItem.update as jest.Mock).mockResolvedValue({ id: 'i-1' });
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (ops) => Promise.all(ops));
    mockGeocodeWithGoogleMaps.mockResolvedValue({ lat: 35.6, lng: 139.7 });
  });

  it('rejects duplicate organized itinerary item ids', async () => {
    (mockPrisma.itineraryItem.findMany as jest.Mock).mockResolvedValue([
      { id: 'i-1', tripId: 'trip-1', activity: { id: 'a-1' } },
      { id: 'i-2', tripId: 'trip-1', activity: { id: 'a-2' } },
    ]);
    mockOrganizeItinerary.mockResolvedValue([
      { id: 'i-1', day: 1, timeBlock: 'morning' },
      { id: 'i-1', day: 1, timeBlock: 'afternoon' },
    ]);

    await expect(executeTripActions('trip-1', 'u-1', [{ type: 'itinerary.organize' }]))
      .rejects.toThrow('LLM returned incomplete or invalid itinerary mapping');

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('preserves omitted duration on activity updates', async () => {
    await executeTripActions('trip-1', 'u-1', [{ type: 'activity.update', activityId: 'a-1', title: 'New Title' }]);

    const data = (mockPrisma.activity.update as jest.Mock).mock.calls[0][0].data;
    expect(data.title).toBe('New Title');
    expect(data).not.toHaveProperty('durationMinutes');
  });

  it('preserves omitted fields on existing preference updates', async () => {
    await executeTripActions('trip-1', 'u-1', [{ type: 'preference.updateMe', budget: 'luxury' }]);

    expect(mockPrisma.preference.update).toHaveBeenCalledWith({
      where: { id: 'pref-1' },
      data: { budget: 'luxury' },
    });
  });

  it('deletes activity and itinerary references in one transaction', async () => {
    await executeTripActions('trip-1', 'u-1', [{ type: 'activity.delete', activityId: 'a-1' }]);

    expect(mockPrisma.itineraryItem.deleteMany).toHaveBeenCalledWith({ where: { activityId: 'a-1' } });
    expect(mockPrisma.activity.delete).toHaveBeenCalledWith({ where: { id: 'a-1' } });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect((mockPrisma.$transaction as jest.Mock).mock.calls[0][0]).toHaveLength(2);
  });

  it('skips generated activities with invalid duration before geocoding', async () => {
    mockGenerateActivities.mockResolvedValue([
      {
        type: 'food',
        title: 'Bad Cafe',
        description: 'Invalid duration',
        city: 'Tokyo',
        suggestedTime: 'lunch',
        durationMinutes: -1,
      },
    ]);

    await executeTripActions('trip-1', 'u-1', [{ type: 'activity.generate', city: 'Tokyo' }]);

    expect(mockGeocodeWithGoogleMaps).not.toHaveBeenCalled();
    expect(mockPrisma.activity.create).not.toHaveBeenCalled();
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
