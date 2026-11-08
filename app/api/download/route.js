import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { findOrderByCode, sbFetch, insertSettingVersion } from '../../../lib/supabase';
import { getCatalogue } from '../../../lib/catalog-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const last10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);

async function countDownloads(orderId) {
  const res = await sbFetch('site_settings?key=like.estore_dlcount_' + encodeURIComponent(orderId) + '_*&select=key&limit=100');
  if (!res.ok) return 0;
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) ? rows.length : 0;
}

// POST /api/download { action: 'info'|'download', orderId, phone }
// One-gate rule: order completed + buyer phone match + per-order limit.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId || '').trim().toUpperCase();
  const phone10 = last10(body.phone || '');
  if (!orderId || phone10.length !== 10) return NextResponse.json({ ok: false, reason: 'input' }, { status: 400 });

  const order = await findOrderByCode(orderId);
  if (!order) return NextResponse.json({ ok: false, reason: 'notfound' }, { status: 404 });
  if (last10(order.whatsapp_number) !== phone10) return NextResponse.json({ ok: false, reason: 'phone' }, { status: 403 });
  if (order.status !== 'completed') return NextResponse.json({ ok: false, reason: 'status' }, { status: 403 });

  const catalogue = await getCatalogue();
  const product = catalogue.find((p) => p.title === order.service_name && p.type === 'download');
  if (!product || !product.downloadFile) return NextResponse.json({ ok: false, available: false, reason: 'nodl' });

  const limit = product.downloadLimit || 3;
  const used = await countDownloads(orderId);
  const remaining = Math.max(0, limit - used);
  if (body.action === 'info') return NextResponse.json({ ok: true, available: true, remaining, limit });
  if (body.action !== 'download') return NextResponse.json({ ok: false, reason: 'input' }, { status: 400 });
  if (remaining <= 0) return NextResponse.json({ ok: false, reason: 'limit' }, { status: 403 });

  let data;
  try {
    data = await readFile(path.join(process.cwd(), 'delivery-private', product.downloadFile));
  } catch {
    return NextResponse.json({ ok: false, reason: 'file' }, { status: 500 });
  }
  await insertSettingVersion('estore_dlcount_' + orderId, { ts: Date.now() });
  return new NextResponse(data, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="' + (product.downloadName || 'download.html') + '"',
      'Content-Length': String(data.length),
      'Cache-Control': 'no-store',
    },
  });
}
