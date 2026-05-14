import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const session = getSession(params.id);
  if (!session) {
    return new NextResponse('Session not found', { status: 404 });
  }
  return NextResponse.json(session);
}
