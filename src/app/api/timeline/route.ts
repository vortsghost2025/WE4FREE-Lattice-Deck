import { NextResponse } from 'next/server';
import { fetchTimeline } from '@/lib/services/dataAdapter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get('hours') || '48');
  const lane = searchParams.get('lane');
  const type = searchParams.get('type');

  return NextResponse.json(fetchTimeline(hours, lane || undefined, type || undefined));
}