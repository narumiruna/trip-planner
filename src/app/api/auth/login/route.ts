import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, setSessionCookie, validateEmail, verifyPassword } from '@/lib/auth';

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
  const { email, password } = body as { email?: unknown; password?: unknown };

  if (typeof email !== 'string' || !validateEmail(email) || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const { rawToken, session } = await createSession(user.id);
  const res = NextResponse.json({ id: user.id, email: user.email, name: user.name });
  setSessionCookie(res, rawToken, session.expiresAt);
  return res;
}
