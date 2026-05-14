import { NextResponse } from 'next/server';
import { updateSession, getSession } from '@/lib/session';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const session = getSession(params.id);
  if (!session) {
    return new NextResponse('Session not found', { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // MOCK BLOB STORAGE
    // In production, we would use: 
    // import { put } from '@vercel/blob';
    // const blob = await put(file.name, file, { access: 'public' });
    // const url = blob.url;
    
    // For local dev without Vercel token, we'll convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const url = `data:${file.type};base64,${base64}`;

    updateSession(params.id, {
      status: 'uploaded',
      imageUrl: url
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Error uploading file', { status: 500 });
  }
}
