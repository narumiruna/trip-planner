import { NextRequest } from 'next/server';
import { GET as listActivities, POST as createActivity } from '@/app/api/trips/[id]/activities/route';
import { DELETE as deleteActivity, PATCH as updateActivity } from '@/app/api/activities/[id]/route';
import { POST as approveActivity } from '@/app/api/activities/[id]/approve/route';
import { POST as rejectActivity } from '@/app/api/activities/[id]/reject/route';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    activity: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
    preference: {
      findMany: jest.fn(),
    },
    tripMember: {
      findMany: jest.fn(),
    },
    itineraryItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/llm', () => ({
  generateActivities: jest.fn(),
}));

jest.mock('@/lib/geocoding', () => ({
  geocodeWithGoogleMaps: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
  requireTripRole: jest.fn(),
  buildForbiddenResponse: jest.fn(() => new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })),
}));

import { prisma } from '@/lib/prisma';
import { generateActivities } from '@/lib/llm';
import { geocodeWithGoogleMaps } from '@/lib/geocoding';
import { requireAuth, requireTripRole } from '@/lib/auth';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGenerateActivities = generateActivities as jest.Mock;
const mockGeocodeWithGoogleMaps = geocodeWithGoogleMaps as jest.Mock;
const mockRequireAuth = requireAuth as jest.Mock;
const mockRequireTripRole = requireTripRole as jest.Mock;

describe('activities route integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: 'u-1', email: 'u1@example.com', name: 'U1' });
    mockRequireTripRole.mockResolvedValue({ ok: true, role: 'owner' });
  });

  it('GET /api/trips/[id]/activities returns data without deprecation headers', async () => {
    const fakeActivities = [{ id: 'a-1', tripId: 'trip-1', title: 'Senso-ji', status: 'pending' }];
    (mockPrisma.activity.findMany as jest.Mock).mockResolvedValue(fakeActivities);

    const req = new NextRequest('http://localhost/api/trips/trip-1/activities?sortBy=title&order=asc');
    const res = await listActivities(req, { params: Promise.resolve({ id: 'trip-1' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(fakeActivities);
    expect(res.headers.get('Deprecation')).toBeNull();
    expect(res.headers.get('Link')).toBeNull();
    expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
      where: { tripId: 'trip-1' },
      orderBy: { title: 'asc' },
    });
  });

  it('POST /api/trips/[id]/activities (manual) creates activity without deprecation headers', async () => {
    (mockPrisma.trip.findUnique as jest.Mock).mockResolvedValue({ id: 'trip-1', name: 'Tokyo', cities: '["Tokyo"]' });
    (mockPrisma.activity.findMany as jest.Mock).mockResolvedValue([]);
    mockGeocodeWithGoogleMaps.mockResolvedValue({ lat: 35.7101, lng: 139.8107 });
    const saved = {
      id: 'a-1',
      tripId: 'trip-1',
      type: 'place',
      title: 'Skytree',
      description: 'Landmark',
      reason: '',
      lat: 35.7101,
      lng: 139.8107,
      city: 'Tokyo',
      suggestedTime: 'afternoon',
      durationMinutes: null,
      status: 'pending',
    };
    (mockPrisma.activity.create as jest.Mock).mockResolvedValue(saved);

    const req = new NextRequest('http://localhost/api/trips/trip-1/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'manual',
        title: 'Skytree',
        description: 'Landmark',
        city: 'Tokyo',
      }),
    });

    const res = await createActivity(req, { params: Promise.resolve({ id: 'trip-1' }) });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual(saved);
    expect(res.headers.get('Deprecation')).toBeNull();
    expect(res.headers.get('Link')).toBeNull();
    expect(mockGenerateActivities).not.toHaveBeenCalled();
  });

  it('PATCH /api/activities/[id] rejects empty update bodies before DB update', async () => {
    (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue({ id: 'a-1', tripId: 'trip-1' });
    (mockPrisma.activity.update as jest.Mock).mockResolvedValue({ id: 'a-1' });

    const req = new NextRequest('http://localhost/api/activities/a-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await updateActivity(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/field/i);
    expect(mockPrisma.activity.update).not.toHaveBeenCalled();
  });

  it('PATCH /api/activities/[id] normalizes numeric-string durationMinutes', async () => {
    const updated = { id: 'a-1', tripId: 'trip-1', durationMinutes: 60 };
    (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue({ id: 'a-1', tripId: 'trip-1' });
    (mockPrisma.activity.update as jest.Mock).mockResolvedValue(updated);

    const req = new NextRequest('http://localhost/api/activities/a-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationMinutes: '60' }),
    });
    const res = await updateActivity(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.durationMinutes).toBe(60);
    expect(mockPrisma.activity.update).toHaveBeenCalledWith({
      where: { id: 'a-1' },
      data: { durationMinutes: 60 },
    });
  });

  it('PATCH /api/activities/[id] rejects out-of-range coordinates before DB update', async () => {
    (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue({ id: 'a-1', tripId: 'trip-1' });
    (mockPrisma.activity.update as jest.Mock).mockResolvedValue({ id: 'a-1' });

    const req = new NextRequest('http://localhost/api/activities/a-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 999, lng: 999 }),
    });
    const res = await updateActivity(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/coordinates/i);
    expect(mockPrisma.activity.update).not.toHaveBeenCalled();
  });

  it('DELETE /api/activities/[id] removes itinerary references and activity in one transaction', async () => {
    (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue({ id: 'a-1', tripId: 'trip-1' });
    const tx = {
      itineraryItem: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
      activity: { delete: jest.fn().mockResolvedValue({ id: 'a-1' }) },
    };
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(tx));

    const req = new NextRequest('http://localhost/api/activities/a-1', { method: 'DELETE' });
    const res = await deleteActivity(req, { params: Promise.resolve({ id: 'a-1' }) });

    expect(res.status).toBe(204);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.itineraryItem.deleteMany).toHaveBeenCalledWith({ where: { activityId: 'a-1' } });
    expect(tx.activity.delete).toHaveBeenCalledWith({ where: { id: 'a-1' } });
    expect(mockPrisma.itineraryItem.deleteMany).not.toHaveBeenCalled();
    expect(mockPrisma.activity.delete).not.toHaveBeenCalled();
  });

  it('POST /api/activities/[id]/reject removes itinerary references and updates status in one transaction', async () => {
    const activity = { id: 'a-1', tripId: 'trip-1', status: 'approved' };
    const updated = { ...activity, status: 'rejected' };
    const tx = {
      itineraryItem: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
      activity: { update: jest.fn().mockResolvedValue(updated) },
    };
    (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue(activity);
    (mockPrisma.activity.update as jest.Mock).mockResolvedValue(updated);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(tx));

    const req = new NextRequest('http://localhost/api/activities/a-1/reject', { method: 'POST' });
    const res = await rejectActivity(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('rejected');
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.itineraryItem.deleteMany).toHaveBeenCalledWith({ where: { activityId: 'a-1' } });
    expect(tx.activity.update).toHaveBeenCalledWith({ where: { id: 'a-1' }, data: { status: 'rejected' } });
    expect(mockPrisma.activity.update).not.toHaveBeenCalled();
  });

  it('POST /api/activities/[id]/approve updates status and itinerary inside one transaction', async () => {
    const baseActivity = {
      id: 'a-1',
      tripId: 'trip-1',
      type: 'place',
      title: 'Senso-ji',
      description: 'Temple',
      reason: '',
      lat: 35.7148,
      lng: 139.7967,
      city: 'Tokyo',
      suggestedTime: 'morning',
      durationMinutes: 90,
      status: 'pending',
      itineraryItem: null,
      createdAt: new Date(),
    };
    const updated = { ...baseActivity, status: 'approved' };
    const createdItem = { id: 'ii-1', tripId: 'trip-1', activityId: 'a-1', day: 1, timeBlock: 'morning' };
    const fullItem = { ...createdItem, activity: updated };
    const tx = {
      activity: { update: jest.fn().mockResolvedValue(updated) },
      itineraryItem: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue(createdItem),
        findUnique: jest.fn().mockResolvedValue(fullItem),
      },
    };
    (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue(baseActivity);
    (mockPrisma.activity.update as jest.Mock).mockResolvedValue(updated);
    (mockPrisma.itineraryItem.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.itineraryItem.create as jest.Mock).mockResolvedValue(createdItem);
    (mockPrisma.itineraryItem.findUnique as jest.Mock).mockResolvedValue(fullItem);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(tx));

    const req = new NextRequest('http://localhost/api/activities/a-1/approve', { method: 'POST' });
    const res = await approveActivity(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.activity.status).toBe('approved');
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.activity.update).toHaveBeenCalledWith({ where: { id: 'a-1' }, data: { status: 'approved' } });
    expect(tx.itineraryItem.create).toHaveBeenCalledWith({
      data: { tripId: 'trip-1', activityId: 'a-1', day: 1, timeBlock: 'morning' },
    });
    expect(mockPrisma.activity.update).not.toHaveBeenCalled();
    expect(mockPrisma.itineraryItem.create).not.toHaveBeenCalled();
  });

  it('POST /api/activities/[id]/approve returns approved payload without deprecation headers', async () => {
    const baseActivity = {
      id: 'a-1',
      tripId: 'trip-1',
      type: 'place',
      title: 'Senso-ji',
      description: 'Temple',
      reason: '',
      lat: 35.7148,
      lng: 139.7967,
      city: 'Tokyo',
      suggestedTime: 'morning',
      durationMinutes: 90,
      status: 'pending',
      itineraryItem: { id: 'ii-1', tripId: 'trip-1', activityId: 'a-1', day: 1, timeBlock: 'morning' },
      createdAt: new Date(),
    };
    const updated = { ...baseActivity, status: 'approved' };
    const fullItem = { ...baseActivity.itineraryItem, activity: updated };
    const tx = {
      activity: { update: jest.fn().mockResolvedValue(updated) },
      itineraryItem: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(fullItem),
      },
    };
    (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue(baseActivity);
    (mockPrisma.activity.update as jest.Mock).mockResolvedValue(updated);
    (mockPrisma.itineraryItem.findUnique as jest.Mock).mockResolvedValue(fullItem);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => callback(tx));

    const req = new NextRequest('http://localhost/api/activities/a-1/approve', { method: 'POST' });
    const res = await approveActivity(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.activity.status).toBe('approved');
    expect(res.headers.get('Deprecation')).toBeNull();
    expect(res.headers.get('Link')).toBeNull();
  });
});
