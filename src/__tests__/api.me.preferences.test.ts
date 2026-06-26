import { GET, POST, PUT } from '@/app/api/me/preferences/route';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    preference: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireAuth = requireAuth as jest.Mock;

describe('/api/me/preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: 'u-1', email: 'u1@example.com', name: 'U1' });
  });

  it('GET returns current user preference', async () => {
    (mockPrisma.preference.findFirst as jest.Mock).mockResolvedValue({ id: 'p1', userId: 'u-1', likes: '[]', dislikes: '[]', budget: null });

    const req = new NextRequest('http://localhost/api/me/preferences');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockPrisma.preference.findFirst).toHaveBeenCalledWith({ where: { userId: 'u-1' } });
  });

  it('POST creates preference for current user', async () => {
    (mockPrisma.preference.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrisma.preference.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: [' x ', ' ', 'y'], dislikes: [], budget: 'budget', preferredLanguage: 'zh-TW' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockPrisma.preference.create).toHaveBeenCalledWith({
      data: {
        userId: 'u-1',
        likes: JSON.stringify(['x', 'y']),
        dislikes: JSON.stringify([]),
        budget: 'budget',
        preferredLanguage: 'zh-TW',
      },
    });
  });

  it('returns 400 for invalid JSON on POST before preference lookup', async () => {
    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Invalid JSON/);
    expect(mockPrisma.preference.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.preference.create).not.toHaveBeenCalled();
  });

  it('returns 400 for non-array likes on POST before preference lookup', async () => {
    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: { food: true }, dislikes: [] }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/likes/);
    expect(mockPrisma.preference.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.preference.create).not.toHaveBeenCalled();
  });

  it('returns 400 for unsupported budget on POST before preference lookup', async () => {
    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: [], dislikes: [], budget: 'ultra-luxury' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/budget/);
    expect(mockPrisma.preference.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.preference.create).not.toHaveBeenCalled();
  });

  it('PUT updates existing preference for current user', async () => {
    (mockPrisma.preference.findFirst as jest.Mock).mockResolvedValue({ id: 'p1', userId: 'u-1' });
    (mockPrisma.preference.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: [], dislikes: [], budget: null, preferredLanguage: 'ja-JP' }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(mockPrisma.preference.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: {
        likes: JSON.stringify([]),
        dislikes: JSON.stringify([]),
        budget: null,
        preferredLanguage: 'ja-JP',
      },
    });
  });

  it('PUT preserves omitted preference fields', async () => {
    (mockPrisma.preference.findFirst as jest.Mock).mockResolvedValue({ id: 'p1', userId: 'u-1' });
    (mockPrisma.preference.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: 'luxury' }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(mockPrisma.preference.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { budget: 'luxury' },
    });
  });

  it('returns 400 for non-object JSON on PUT before preference lookup', async () => {
    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(['likes']),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/JSON object/);
    expect(mockPrisma.preference.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.preference.update).not.toHaveBeenCalled();
  });

  it('returns 400 for non-string dislikes on PUT before preference lookup', async () => {
    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: [], dislikes: ['crowds', 123] }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/dislikes/);
    expect(mockPrisma.preference.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.preference.update).not.toHaveBeenCalled();
  });

  it('returns 400 for non-string preferredLanguage on PUT before preference lookup', async () => {
    const req = new NextRequest('http://localhost/api/me/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: [], dislikes: [], preferredLanguage: ['ja'] }),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/preferredLanguage/);
    expect(mockPrisma.preference.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.preference.update).not.toHaveBeenCalled();
  });

  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));

    const req = new NextRequest('http://localhost/api/me/preferences');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});
