import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { isValidDateOnly } from '@/lib/dates';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const trips = await prisma.trip.findMany({
    where: {
      members: {
        some: { userId: auth.id },
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { activities: true, itineraryItems: true },
      },
    },
  });
  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body. Expected a JSON object.' }, { status: 400 });
  }

  const { name, cities, startDate, durationDays } = body as {
    name?: unknown;
    cities?: unknown;
    startDate?: unknown;
    durationDays?: unknown;
  };

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Invalid name. Expected non-empty string.' }, { status: 400 });
  }
  if (!Array.isArray(cities) || cities.length === 0 || cities.some((city) => typeof city !== 'string' || !city.trim())) {
    return NextResponse.json(
      { error: 'Invalid cities. Expected a non-empty array of non-empty strings.' },
      { status: 400 },
    );
  }

  if (startDate != null && startDate !== '' && typeof startDate !== 'string') {
    return NextResponse.json({ error: 'Invalid startDate. Expected YYYY-MM-DD.' }, { status: 400 });
  }

  const normalizedName = name.trim();
  const normalizedCities = cities.map((city) => (city as string).trim());
  const normalizedStartDate = typeof startDate === 'string' && startDate.trim().length > 0
    ? startDate.trim()
    : null;
  const normalizedDurationDays = durationDays == null || durationDays === ''
    ? null
    : Number(durationDays);

  if (normalizedStartDate && !isValidDateOnly(normalizedStartDate)) {
    return NextResponse.json({ error: 'Invalid startDate. Expected YYYY-MM-DD.' }, { status: 400 });
  }

  if (
    normalizedDurationDays != null &&
    (!Number.isInteger(normalizedDurationDays) || normalizedDurationDays <= 0)
  ) {
    return NextResponse.json({ error: 'Invalid durationDays. Expected a positive integer.' }, { status: 400 });
  }

  const trip = await prisma.$transaction(async (tx) => {
    const createdTrip = await tx.trip.create({
      data: {
        name: normalizedName,
        cities: JSON.stringify(normalizedCities),
        startDate: normalizedStartDate,
        durationDays: normalizedDurationDays,
      },
    });
    await tx.tripMember.create({
      data: {
        tripId: createdTrip.id,
        userId: auth.id,
        role: 'owner',
      },
    });
    return createdTrip;
  });

  return NextResponse.json(trip, { status: 201 });
}
