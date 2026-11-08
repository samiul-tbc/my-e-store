import { NextResponse } from 'next/server';
import { findOrderByCode, sbFetch, fetchSetting, parseJson } from '../../../lib/supabase';
import { getCatalogue } from '../../../lib/catalog-server';
import { birthdayLink } from '../../../lib/birthday';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const last10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);

async function downloadRemaining(orderId, limit) {
  try {
    const res = await sbFetch('site_settings?key=like.estore_dlcount_' + encodeURIComponent(orderId) + '_*&select=key&limit=100');
    if (!res.ok) return limit;
    const rows = await res.json();
    return Math.max(0, limit - (Array.isArray(rows) ? rows.length : 0));
  } catch { return limit; }
}

async function statusHistory(code) {
  try {
    const res = await sbFetch('site_settings?key=like.estore_statuslog_' + encodeURIComponent(code) + '_*&select=value&order=key.asc&limit=100');
    if (!res.ok) return [];
    const rows = await res.json().catch(() => []);
    const out = [];
    for (const r of rows || []) { const v = parseJson(r.value, null); if (v && v.status) out.push({ status: v.status, ts: v.ts || 0 }); }
    return out.sort((a, b) => a.ts - b.ts);
  } catch { return []; }
}

async function presentOrder(order, catalogue) {
  const product = catalogue.find((p) => p.title === order.service_name) || null;
  const out = {
    code: order.order_id,
    title: order.service_name,
    price: order.price,
    status: order.status,
    paymentMethod: order.payment_method || '',
    createdAt: order.created_at,
    productId: product ? product.id : null,
    delivery: null,
    history: await statusHistory(order.order_id),
  };
  if (order.status === 'completed' && product) {
    if (product.type === 'download') {
      const remaining = await downloadRemaining(order.order_id, product.downloadLimit || 3);
      out.delivery = { kind: 'download', remaining, limit: product.downloadLimit || 3 };
    } else if (product.infoForm) {
      const payload = parseJson(await fetchSetting('estore_bday_' + order.order_id), null);
      if (payload && payload.name) out.delivery = { kind: 'link', url: birthdayLink(payload) };
    } else {
      const fixed = parseJson(await fetchSetting('estore_autodelivery_' + product.id), null);
      if (fixed && fixed.fixedText) out.delivery = { kind: 'text', text: fixed.fixedText };
    }
  }
  return out;
}

// GET /api/track?q=ES-1234 | phone
export async function GET(req) {
  const q = (new URL(req.url).searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ orders: [] });
  const catalogue = await getCatalogue();
  let rows = [];
  if (/^ES-/i.test(q)) {
    const o = await findOrderByCode(q.toUpperCase());
    if (o) rows = [o];
  } else if (last10(q).length === 10) {
    const res = await sbFetch('orders?whatsapp_number=like.%25' + last10(q) + '&order_id=like.ES-%25&select=*&order=created_at.desc&limit=30');
    if (res.ok) rows = (await res.json()) || [];
  }
  const orders = [];
  for (const o of rows) orders.push(await presentOrder(o, catalogue));
  return NextResponse.json({ orders });
}
