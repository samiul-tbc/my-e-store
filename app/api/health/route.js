import { NextResponse } from 'next/server';
import { sbFetch } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

// Tiny health probe: confirms the database is reachable.
export async function GET() {
  try {
    const res = await sbFetch('site_settings?select=key&limit=1', { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ ok: false, db: 'error', status: res.status }, { status: 503 });
    return NextResponse.json({ ok: true, db: 'up', ts: Date.now() });
  } catch {
    return NextResponse.json({ ok: false, db: 'unreachable' }, { status: 503 });
  }
}
