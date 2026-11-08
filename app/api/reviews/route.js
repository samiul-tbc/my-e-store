import { NextResponse } from 'next/server';
import { getProduct, getReviews } from '../../../lib/catalog-server';
import { insertSettingVersion, sbFetch } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const last10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);

// GET /api/reviews?product=<id> — list (phones stripped) with verified flags.
export async function GET(req) {
  const id = new URL(req.url).searchParams.get('product') || '';
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ reviews: [] });
  const list = await getReviews(id);
  const out = [];
  for (const r of list) {
    let verified = false;
    const p10 = last10(r.phone);
    if (p10.length === 10) {
      try {
        const res = await sbFetch('orders?whatsapp_number=like.%25' + p10 + '&status=eq.completed&select=service_name&limit=50');
        if (res.ok) {
          const rows = await res.json();
          verified = (rows || []).some((o) => String(o.service_name || '').includes(product.title));
        }
      } catch {}
    }
    out.push({ name: r.name, rating: r.rating, text: r.text, ts: r.ts, verified, reply: r.reply || null });
  }
  out.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  return NextResponse.json({ reviews: out });
}

// POST /api/reviews { productId, name, rating, text, phone? }
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const product = await getProduct(String(body.productId || ''));
  if (!product) return NextResponse.json({ ok: false, error: 'product' }, { status: 404 });
  const name = String(body.name || '').trim().slice(0, 60);
  const text = String(body.text || '').trim().slice(0, 600);
  const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
  if (!name || !text) return NextResponse.json({ ok: false, error: 'input' }, { status: 400 });
  const list = await getReviews(product.id);
  list.push({ name, rating, text, phone: String(body.phone || '').slice(0, 20), ts: Date.now() });
  const trimmed = list.slice(-50);
  const ok = await insertSettingVersion('estore_reviews_' + product.id, trimmed);
  return NextResponse.json({ ok });
}
