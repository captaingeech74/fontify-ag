import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

export async function POST() {
  const sessionId = crypto.randomUUID();
  const session = createSession(sessionId);
  return NextResponse.json(session);
}
