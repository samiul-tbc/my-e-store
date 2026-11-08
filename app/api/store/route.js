import { NextResponse } from 'next/server';
import { fetchSetting, parseJson } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/store — public store config (WhatsApp number, admin-editable).
export async function GET() {
  const cfg = parseJson(await fetchSetting('estore_store'), null);
  const whatsapp = cfg && cfg.whatsapp ? String(cfg.whatsapp).replace(/\D/g, '') : '8801319760720';
  return NextResponse.json({ whatsapp });
}
