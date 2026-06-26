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

function normalizeStringList(value: unknown, fieldName: 'likes' | 'dislikes'): string[] | NextResponse {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    return NextResponse.json({ error: `Invalid ${fieldName}. Expected an array of strings.` }, { status: 400 });
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function normalizeOptionalString(value: unknown, fieldName: 'budget' | 'preferredLanguage', allowed: Set<string>) {
  if (value == null || value === '') return { ok: true as const, value: null };
  if (typeof value !== 'string') return { ok: false as const, response: NextResponse.json({ error: `Invalid ${fieldName}.` }, { status: 400 }) };

  const normalized = value.trim();
  if (!normalized) return { ok: true as const, value: null };
  if (!allowed.has(normalized)) return { ok: false as const, response: NextResponse.json({ error: `Invalid ${fieldName}.` }, { status: 400 }) };
  return { ok: true as const, value: normalized };
}

const allowedBudgets = new Set(['budget', 'mid-range', 'luxury']);
const allowedLanguages = new Set(['zh-TW', 'zh-CN', 'en', 'ja', 'ja-JP', 'ko']);

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
  const normalizedLikes = normalizeStringList(likes, 'likes');
  if (normalizedLikes instanceof NextResponse) return normalizedLikes;
  const normalizedDislikes = normalizeStringList(dislikes, 'dislikes');
  if (normalizedDislikes instanceof NextResponse) return normalizedDislikes;
  const normalizedBudget = normalizeOptionalString(budget, 'budget', allowedBudgets);
  if (!normalizedBudget.ok) return normalizedBudget.response;
  const normalizedLanguage = normalizeOptionalString(preferredLanguage, 'preferredLanguage', allowedLanguages);
  if (!normalizedLanguage.ok) return normalizedLanguage.response;
  const existing = await prisma.preference.findFirst({ where: { userId: auth.id } });
  if (existing) return NextResponse.json({ error: 'Preference already exists' }, { status: 409 });

  const pref = await prisma.preference.create({
    data: {
      userId: auth.id,
      likes: JSON.stringify(normalizedLikes),
      dislikes: JSON.stringify(normalizedDislikes),
      budget: normalizedBudget.value,
      preferredLanguage: normalizedLanguage.value,
    },
  });

  return NextResponse.json(pref, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await readJsonObject(req);
  if (body instanceof NextResponse) return body;
  const data: { likes?: string; dislikes?: string; budget?: string | null; preferredLanguage?: string | null } = {};
  if ('likes' in body) {
    const normalizedLikes = normalizeStringList(body.likes, 'likes');
    if (normalizedLikes instanceof NextResponse) return normalizedLikes;
    data.likes = JSON.stringify(normalizedLikes);
  }
  if ('dislikes' in body) {
    const normalizedDislikes = normalizeStringList(body.dislikes, 'dislikes');
    if (normalizedDislikes instanceof NextResponse) return normalizedDislikes;
    data.dislikes = JSON.stringify(normalizedDislikes);
  }
  if ('budget' in body) {
    const normalizedBudget = normalizeOptionalString(body.budget, 'budget', allowedBudgets);
    if (!normalizedBudget.ok) return normalizedBudget.response;
    data.budget = normalizedBudget.value;
  }
  if ('preferredLanguage' in body) {
    const normalizedLanguage = normalizeOptionalString(body.preferredLanguage, 'preferredLanguage', allowedLanguages);
    if (!normalizedLanguage.ok) return normalizedLanguage.response;
    data.preferredLanguage = normalizedLanguage.value;
  }
  const existing = await prisma.preference.findFirst({ where: { userId: auth.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (Object.keys(data).length === 0) return NextResponse.json(existing);

  const pref = await prisma.preference.update({
    where: { id: existing.id },
    data,
  });
  return NextResponse.json(pref);
}
