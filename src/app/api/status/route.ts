import { NextResponse } from 'next/server';
import { fetchStatus } from '@/lib/services/dataAdapter';

export async function GET() {
  return NextResponse.json(fetchStatus());
}