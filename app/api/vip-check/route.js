import { NextResponse } from 'next/server';
import { getVipState } from '../../../lib/vip-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/vip-check { phone, subtotal } -> VIP availability + discount
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const subtotal = Number(body.subtotal) || 0;
  const st = await getVipState(body.phone || '');
  return NextResponse.json({
    ok: true,
    available: st.available,
    remaining: st.remaining,
    completed: st.completed,
    discount: st.available && subtotal > 0 ? Math.round((subtotal * st.percent) / 100) : 0,
  });
}
