import { NextResponse } from 'next/server';
import { findOrderByCode } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const last10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);

// GET /api/invoice?code=ES-1234&phone=... — order details for the printable
// invoice. Phone must match the order (order codes alone are enumerable).
export async function GET(req) {
  const u = new URL(req.url);
  const code = (u.searchParams.get('code') || '').trim().toUpperCase();
  const phone10 = last10(u.searchParams.get('phone') || '');
  if (!code || phone10.length !== 10) return NextResponse.json({ ok: false, error: 'input' }, { status: 400 });
  const order = await findOrderByCode(code);
  if (!order) return NextResponse.json({ ok: false, error: 'notfound' }, { status: 404 });
  if (last10(order.whatsapp_number) !== phone10) return NextResponse.json({ ok: false, error: 'phone' }, { status: 403 });
  return NextResponse.json({
    ok: true,
    order: {
      code: order.order_id,
      title: order.service_name,
      price: order.price,
      status: order.status,
      paymentMethod: order.payment_method || '',
      trxId: order.trx_id || '',
      customerName: order.customer_name,
      phone: order.whatsapp_number,
      createdAt: order.created_at,
    },
  });
}
