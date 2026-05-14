import { NextResponse } from 'next/server';
import { fetchLanes } from '@/lib/services/dataAdapter';

export async function GET() {
  return NextResponse.json(fetchLanes());
}