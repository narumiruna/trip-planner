import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateActivities } from '@/lib/llm';
import { getCoordinateCentroid, normalizeCoordinateBatch } from '@/lib/coordinates';
import { geocodeWithGoogleMaps } from '@/lib/geocoding';
import { buildForbiddenResponse, requireAuth, requireTripRole } from '@/lib/auth';
import { isItineraryTimeBlock } from '@/lib/time-block';

type NormalizedGeneratedActivity = {
  type: ActivityType;
  title: string;
  description: string;
  reason: string;
  city: string;
  suggestedTime: string;
  durationMinutes: number | null;
};

type ResolvedActivity = NormalizedGeneratedActivity & { lat: number; lng: number };
type ActivitySortField = 'createdAt' | 'title' | 'city' | 'status';
type ActivityType = 'food' | 'place' | 'hotel';
type SortOrder = 'asc' | 'desc';

function hasResolvedCoordinates(activity: ResolvedActivity | null): activity is ResolvedActivity {
  return activity !== null;
}

function mapGoogleTypesToActivityType(types: string[]): 'food' | 'hotel' | 'place' {
  const normalized = types.map((type) => type.toLowerCase());
  if (normalized.includes('lodging')) return 'hotel';
  if (normalized.includes('restaurant') || normalized.includes('food') || normalized.includes('cafe')) return 'food';
  return 'place';
}

function parseCoordinatePair(latValue: unknown, lngValue: unknown) {
  const hasLat = latValue != null && latValue !== '';
  const hasLng = lngValue != null && lngValue !== '';
  if (!hasLat && !hasLng) return { ok: true as const, coordinates: null };
  if (!hasLat || !hasLng) return { ok: false as const };

  const lat = Number(latValue);
  const lng = Number(lngValue);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { ok: false as const };
  return { ok: true as const, coordinates: { lat, lng } };
}

function normalizeManualActivityType(value: unknown): ActivityType | null {
  if (value == null || value === '') return 'place';
  if (value === 'food' || value === 'place' || value === 'hotel') return value;
  return null;
}

function normalizeManualSuggestedTime(value: unknown) {
  if (value == null || value === '') return 'afternoon';
  return typeof value === 'string' && isItineraryTimeBlock(value) ? value : null;
}

function normalizeDurationMinutes(value: unknown) {
  if (value == null || value === '') return { ok: true as const, value: null };
  if (typeof value !== 'number' && typeof value !== 'string') return { ok: false as const };

  const duration = Number(value);
  if (!Number.isInteger(duration) || duration <= 0) return { ok: false as const };
  return { ok: true as const, value: duration };
}

function normalizeGeneratedActivity(value: unknown, fallbackCity: string): NormalizedGeneratedActivity | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const description = typeof payload.description === 'string' ? payload.description.trim() : '';
  if (!title || !description) return null;

  const type = normalizeManualActivityType(payload.type);
  const suggestedTime = normalizeManualSuggestedTime(payload.suggestedTime);
  const durationMinutes = normalizeDurationMinutes(payload.durationMinutes);
  if (!type || !suggestedTime || !durationMinutes.ok) return null;

  return {
    type,
    title,
    description,
    reason: typeof payload.reason === 'string' ? payload.reason.trim() : '',
    city: typeof payload.city === 'string' && payload.city.trim() ? payload.city.trim() : fallbackCity,
    suggestedTime,
    durationMinutes: durationMinutes.value,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const access = await requireTripRole(id, auth.id, ['owner', 'viewer']);
  if (!access.ok) return buildForbiddenResponse();

  const sortBy = req.nextUrl.searchParams.get('sortBy');
  const order = req.nextUrl.searchParams.get('order');
  const supportedSortBy: ActivitySortField[] = ['createdAt', 'title', 'city', 'status'];
  const resolvedSortBy: ActivitySortField = supportedSortBy.includes(sortBy as ActivitySortField)
    ? (sortBy as ActivitySortField)
    : 'createdAt';
  const resolvedOrder: SortOrder = order === 'asc' ? 'asc' : 'desc';

  const activities = await prisma.activity.findMany({
    where: { tripId: id },
    orderBy: { [resolvedSortBy]: resolvedOrder },
  });
  return NextResponse.json(activities);
}

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

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

  if (payload.mode === 'manual') {
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    const description = typeof payload.description === 'string' ? payload.description.trim() : '';
    const city = typeof payload.city === 'string' ? payload.city.trim() : '';

    if (!title || !description || !city) {
      return NextResponse.json(
        { error: 'Manual activity requires non-empty title, description, and city' },
        { status: 400 }
      );
    }

    const type = normalizeManualActivityType(payload.type);
    if (!type) {
      return NextResponse.json({ error: 'Invalid type. Expected one of food/place/hotel.' }, { status: 400 });
    }
    const suggestedTime = normalizeManualSuggestedTime(payload.suggestedTime);
    if (!suggestedTime) {
      return NextResponse.json({ error: 'Invalid suggestedTime.' }, { status: 400 });
    }
    const durationMinutes = normalizeDurationMinutes(payload.durationMinutes);
    if (!durationMinutes.ok) {
      return NextResponse.json({ error: 'Invalid durationMinutes. Expected a positive integer.' }, { status: 400 });
    }

    const manualCoordinates = parseCoordinatePair(payload.lat, payload.lng);
    if (!manualCoordinates.ok) {
      return NextResponse.json(
        { error: 'Invalid coordinates. lat and lng must both be finite numbers when provided.' },
        { status: 400 }
      );
    }
    const resolvedCoordinates = manualCoordinates.coordinates
      ?? await geocodeWithGoogleMaps(`${title}, ${city}`);
    if (!resolvedCoordinates) {
      return NextResponse.json(
        { error: 'Failed to resolve coordinates for this activity. Please try again or provide valid lat/lng.' },
        { status: 400 }
      );
    }

    const normalized = normalizeCoordinateBatch([resolvedCoordinates])[0];
    if (!normalized) {
      return NextResponse.json(
        { error: 'Invalid coordinates. lat and lng must both be finite numbers when provided.' },
        { status: 400 }
      );
    }
    const activity = await prisma.activity.create({
      data: {
        tripId: id,
        type,
        title,
        description,
        reason: '',
        lat: normalized.lat,
        lng: normalized.lng,
        city,
        suggestedTime,
        durationMinutes: durationMinutes.value,
        status: 'pending',
      },
    });

    return NextResponse.json(activity, { status: 201 });
  }

  if (payload.mode === 'google_place') {
    const placeId = typeof payload.placeId === 'string' ? payload.placeId.trim() : '';
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    const description = typeof payload.description === 'string' && payload.description.trim()
      ? payload.description.trim()
      : 'Imported from Google Maps';
    const city = typeof payload.city === 'string' && payload.city.trim()
      ? payload.city.trim()
      : 'Unknown';
    const formattedAddress = typeof payload.formattedAddress === 'string' ? payload.formattedAddress.trim() : '';
    const coordinates = parseCoordinatePair(payload.lat, payload.lng);
    const types = Array.isArray(payload.types)
      ? payload.types.filter((type: unknown): type is string => typeof type === 'string' && type.trim().length > 0)
      : [];
    const suggestedTime = normalizeManualSuggestedTime(payload.suggestedTime);
    if (!suggestedTime) {
      return NextResponse.json({ error: 'Invalid suggestedTime.' }, { status: 400 });
    }
    const durationMinutes = normalizeDurationMinutes(payload.durationMinutes);
    if (!durationMinutes.ok) {
      return NextResponse.json({ error: 'Invalid durationMinutes. Expected a positive integer.' }, { status: 400 });
    }

    if (!placeId || !title || !coordinates.ok || !coordinates.coordinates) {
      return NextResponse.json(
        { error: 'Google place activity requires non-empty placeId, title, lat, and lng' },
        { status: 400 }
      );
    }

    const duplicate = await prisma.activity.findFirst({
      where: {
        tripId: id,
        googlePlaceId: placeId,
      },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ error: 'This place is already added to the trip' }, { status: 409 });
    }

    const normalized = normalizeCoordinateBatch([coordinates.coordinates])[0];
    if (!normalized) {
      return NextResponse.json(
        { error: 'Invalid coordinates. lat and lng must both be finite numbers when provided.' },
        { status: 400 }
      );
    }
    const activity = await prisma.activity.create({
      data: {
        tripId: id,
        type: mapGoogleTypesToActivityType(types),
        title,
        description,
        reason: '',
        lat: normalized.lat,
        lng: normalized.lng,
        city,
        suggestedTime,
        durationMinutes: durationMinutes.value,
        status: 'pending',
        googlePlaceId: placeId,
        formattedAddress: formattedAddress || null,
        googleTypes: types.length > 0 ? JSON.stringify(types) : null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  }

  const city = typeof payload.city === 'string' ? payload.city.trim() : '';
  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  const members = await prisma.tripMember.findMany({
    where: { tripId: id },
    select: { userId: true },
  });
  const allPreferences = await prisma.preference.findMany({
    where: {
      userId: {
        in: members.map((member) => member.userId),
      },
    },
  });
  const existingActivities = await prisma.activity.findMany({
    where: { tripId: id },
  });
  const existingCenter = getCoordinateCentroid(
    existingActivities.filter((activity) => activity.city === city)
  );

  const generated = await generateActivities(allPreferences, city, existingActivities);
  const generatedActivities = Array.isArray(generated)
    ? generated
        .map((activity) => normalizeGeneratedActivity(activity, city))
        .filter((activity): activity is NormalizedGeneratedActivity => activity !== null)
    : [];
  const withCoordinates = await Promise.all(generatedActivities.map(async (activity) => {
    const geocoded = await geocodeWithGoogleMaps(`${activity.title}, ${activity.city}`);
    return geocoded ? { ...activity, ...geocoded } : null;
  }));
  const normalizedGenerated = normalizeCoordinateBatch(
    withCoordinates.filter(hasResolvedCoordinates),
    { reference: existingCenter ?? undefined }
  );

  const activities = await prisma.$transaction(
    normalizedGenerated.map((activity) =>
      prisma.activity.create({
        data: {
          tripId: id,
          type: activity.type || 'place',
          title: activity.title,
          description: activity.description,
          reason: activity.reason || '',
          lat: activity.lat,
          lng: activity.lng,
          city: activity.city || city,
          suggestedTime: activity.suggestedTime || 'afternoon',
          durationMinutes: activity.durationMinutes || null,
          status: 'pending',
        },
      })
    )
  );

  return NextResponse.json(activities, { status: 201 });
}
