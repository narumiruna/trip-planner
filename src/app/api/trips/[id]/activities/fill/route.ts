import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fillActivityDetails } from '@/lib/llm';
import { geocodeWithGoogleMaps } from '@/lib/geocoding';
import { buildForbiddenResponse, requireAuth, requireTripRole } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const access = await requireTripRole(id, auth.id, ['owner']);
  if (!access.ok) return buildForbiddenResponse();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body. Expected a JSON object.' }, { status: 400 });
  }
  const payload = body as Record<string, unknown>;
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const city = typeof payload.city === 'string' ? payload.city.trim() : '';

  if (!title || !city) {
    return NextResponse.json(
      { error: 'title and city are required' },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

  const [filled, geocoded] = await Promise.all([
    fillActivityDetails(title, city),
    geocodeWithGoogleMaps(`${title}, ${city}`),
  ]);

  return NextResponse.json({
    ...filled,
    lat: geocoded?.lat ?? null,
    lng: geocoded?.lng ?? null,
  });
}
