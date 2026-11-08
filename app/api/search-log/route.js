import { NextResponse } from 'next/server';
import { insertSettingVersion } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/search-log { q } — log a search that found nothing (demand data).
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const q = String(body.q || '').trim().toLowerCase().slice(0, 60);
  if (q.length < 3) return NextResponse.json({ ok: false });
  const ok = await insertSettingVersion('estore_searchlog', { q, ts: Date.now() });
  return NextResponse.json({ ok });
}
