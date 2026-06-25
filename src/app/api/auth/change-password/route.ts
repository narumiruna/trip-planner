import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, verifyPassword, validatePassword, hashPassword } from '@/lib/auth';

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
  const { currentPassword, newPassword } = body as { currentPassword?: unknown; newPassword?: unknown };

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  if (!validatePassword(newPassword)) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: auth.id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: auth.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ message: 'Password updated' });
}
