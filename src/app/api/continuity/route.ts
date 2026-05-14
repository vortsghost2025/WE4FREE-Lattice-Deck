import { NextResponse } from 'next/server';
import { fetchContinuity } from '@/lib/services/dataAdapter';

export async function GET() {
  return NextResponse.json(fetchContinuity());
}