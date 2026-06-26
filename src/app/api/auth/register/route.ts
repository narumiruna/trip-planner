import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword, setSessionCookie, validateEmail, validatePassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body. Expected a JSON object.' }, { status: 400 });
  }
  const { email, password, name } = body as { email?: unknown; password?: unknown; name?: unknown };

  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!validateEmail(normalizedEmail) || !validatePassword(password) || !name.trim()) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const { rawToken, session } = await createSession(user.id);
  const res = NextResponse.json(user, { status: 201 });
  setSessionCookie(res, rawToken, session.expiresAt);
  return res;
}
