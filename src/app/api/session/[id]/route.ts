import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = getSession(params.id);
  if (!session) {
    return new NextResponse('Session not found', { status: 404 });
  }
  return NextResponse.json(session);
}
