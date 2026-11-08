import { NextResponse } from 'next/server';
import { getPaymentConfig } from '../../../lib/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cfg = await getPaymentConfig();
  return NextResponse.json(cfg);
}
