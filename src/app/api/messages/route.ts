import { NextResponse } from 'next/server';
import { fetchMessages, createMessage } from '@/lib/services/dataAdapter';
import type { SendMessageRequest } from '@/lib/services/dataAdapter';

export async function GET() {
  return NextResponse.json(fetchMessages());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SendMessageRequest | null;
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const result = createMessage(body);
  return NextResponse.json(result, { status: 201 });
}