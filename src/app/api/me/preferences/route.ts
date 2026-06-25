import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

async function readJsonObject(req: NextRequest): Promise<Record<string, unknown> | NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body. Expected a JSON object.' }, { status: 400 });
  }
  return body as Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const pref = await prisma.preference.findFirst({
    where: { userId: auth.id },
  });
  return NextResponse.json(pref || null);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await readJsonObject(req);
  if (body instanceof NextResponse) return body;
  const { likes, dislikes, budget, preferredLanguage } = body;
  const existing = await prisma.preference.findFirst({ where: { userId: auth.id } });
  if (existing) return NextResponse.json({ error: 'Preference already exists' }, { status: 409 });

  const pref = await prisma.preference.create({
    data: {
      userId: auth.id,
      likes: JSON.stringify(likes || []),
      dislikes: JSON.stringify(dislikes || []),
      budget: (budget as string | null | undefined) || null,
      preferredLanguage: typeof preferredLanguage === 'string' ? preferredLanguage.trim() || null : null,
    },
  });

  return NextResponse.json(pref, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await readJsonObject(req);
  if (body instanceof NextResponse) return body;
  const { likes, dislikes, budget, preferredLanguage } = body;
  const existing = await prisma.preference.findFirst({ where: { userId: auth.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pref = await prisma.preference.update({
    where: { id: existing.id },
    data: {
      likes: JSON.stringify(likes || []),
      dislikes: JSON.stringify(dislikes || []),
      budget: (budget as string | null | undefined) || null,
      preferredLanguage: typeof preferredLanguage === 'string' ? preferredLanguage.trim() || null : null,
    },
  });
  return NextResponse.json(pref);
}
