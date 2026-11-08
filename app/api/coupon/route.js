import { NextResponse } from 'next/server';
import { validateCoupon } from '../../../lib/coupons-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/coupon { code, subtotal } -> { ok, percent, discount }
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const subtotal = Number(body.subtotal) || 0;
  const v = await validateCoupon(body.code, subtotal);
  if (!v) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, code: v.code, percent: v.percent, discount: v.discount });
}
