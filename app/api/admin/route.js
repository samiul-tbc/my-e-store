import { NextResponse } from 'next/server';
import { getPinHash, setPin, hashPin, makeToken, verifyToken } from '../../../lib/admin-auth';
import { fetchSetting, insertSettingVersion, parseJson, sbFetch, listOrdersByIds, updateOrderStatus } from '../../../lib/supabase';
import { getCatalogue, getReviews } from '../../../lib/catalog-server';
import { getCoupons } from '../../../lib/coupons-server';
import { getPaymentConfig } from '../../../lib/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function estoreOrderCodes() {
  const res = await sbFetch('site_settings?key=like.estore_ordidx_*&select=key&order=key.desc&limit=400');
  if (!res.ok) return [];
  const rows = await res.json().catch(() => []);
  return (rows || []).map((r) => String(r.key).replace('estore_ordidx_', ''));
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');

  // ---- login / first-time PIN setup ----
  if (action === 'login') {
    const pin = String(body.pin || '');
    if (pin.length < 4) return NextResponse.json({ ok: false, error: 'pin_short' }, { status: 400 });
    const existing = await getPinHash();
    if (!existing) {
      await setPin(pin);
      const h = await getPinHash();
      return NextResponse.json({ ok: true, token: makeToken(h), first: true });
    }
    if (hashPin(pin) === existing) return NextResponse.json({ ok: true, token: makeToken(existing) });
    return NextResponse.json({ ok: false, error: 'pin_wrong' }, { status: 401 });
  }

  if (!(await verifyToken(req))) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 });

  if (action === 'change-pin') {
    const pin = String(body.pin || '');
    if (pin.length < 4) return NextResponse.json({ ok: false, error: 'pin_short' }, { status: 400 });
    await setPin(pin);
    const h = await getPinHash();
    return NextResponse.json({ ok: true, token: makeToken(h) });
  }

  if (action === 'data') {
    const codes = await estoreOrderCodes();
    const [orders, products, coupons, announcementRaw, payments, annMetaRaw] = await Promise.all([
      listOrdersByIds(codes),
      getCatalogue(),
      getCoupons(),
      fetchSetting('estore_announcement'),
      getPaymentConfig(),
      fetchSetting('estore_announcement_meta'),
    ]);
    const annMeta = parseJson(annMetaRaw, null);
    const reviews = {};
    const autodelivery = {};
    for (const p of products) {
      reviews[p.id] = await getReviews(p.id);
      autodelivery[p.id] = parseJson(await fetchSetting('estore_autodelivery_' + p.id), null);
    }
    let searchLog = [];
    try {
      const slRes = await sbFetch('site_settings?key=like.estore_searchlog_*&select=value&limit=300');
      if (slRes.ok) {
        const rows = await slRes.json().catch(() => []);
        const counts = {};
        for (const r of rows || []) { const v = parseJson(r.value, null); if (v && v.q) counts[v.q] = (counts[v.q] || 0) + 1; }
        searchLog = Object.entries(counts).map(([q, n]) => ({ q, n })).sort((a, b) => b.n - a.n).slice(0, 20);
      }
    } catch {}
    let referralCount = 0;
    try {
      const rfRes = await sbFetch('site_settings?key=like.estore_ordidx_*&select=value&limit=400');
      if (rfRes.ok) {
        const rows = await rfRes.json().catch(() => []);
        for (const r of rows || []) { const v = parseJson(r.value, null); if (v && v.ref) referralCount += 1; }
      }
    } catch {}
    return NextResponse.json({
      ok: true, orders, products, coupons, searchLog, referralCount,
      announcement: typeof announcementRaw === 'string' ? announcementRaw : '',
      announcementEndsAt: annMeta && annMeta.endsAt ? annMeta.endsAt : '',
      payments, reviews, autodelivery,
    });
  }

  if (action === 'set-status') {
    const order = await (async () => {
      const res = await sbFetch('orders?order_id=eq.' + encodeURIComponent(String(body.orderId || '')) + '&select=id&limit=1');
      if (!res.ok) return null;
      const rows = await res.json().catch(() => []);
      return rows && rows[0] ? rows[0] : null;
    })();
    if (!order) return NextResponse.json({ ok: false, error: 'notfound' }, { status: 404 });
    const ok = await updateOrderStatus(order.id, String(body.status || 'pending'));
    return NextResponse.json({ ok });
  }

  if (action === 'save-products') {
    if (!Array.isArray(body.products)) return NextResponse.json({ ok: false }, { status: 400 });
    const ok = await insertSettingVersion('estore_products', body.products);
    return NextResponse.json({ ok });
  }

  if (action === 'save-coupons') {
    if (!Array.isArray(body.coupons)) return NextResponse.json({ ok: false }, { status: 400 });
    const ok = await insertSettingVersion('estore_coupons', body.coupons);
    return NextResponse.json({ ok });
  }

  if (action === 'save-announcement') {
    const ok = await insertSettingVersion('estore_announcement', String(body.text || '').slice(0, 200));
    await insertSettingVersion('estore_announcement_meta', { endsAt: body.endsAt ? String(body.endsAt) : null });
    return NextResponse.json({ ok });
  }

  if (action === 'test-telegram') {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chat) return NextResponse.json({ ok: false, configured: false });
    try {
      const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text: '✅ Test alert — TBC × E-store admin' }),
      });
      return NextResponse.json({ ok: r.ok, configured: true });
    } catch { return NextResponse.json({ ok: false, configured: true }); }
  }

  if (action === 'save-payments') {
    const ok = await insertSettingVersion('estore_payments', {
      methods: Array.isArray(body.methods) ? body.methods : [],
      usdtAddress: String(body.usdtAddress || ''),
      usdtRate: Number(body.usdtRate) || 120,
    });
    return NextResponse.json({ ok });
  }

  if (action === 'save-autodelivery') {
    const ok = await insertSettingVersion('estore_autodelivery_' + String(body.productId || ''), {
      fixedText: String(body.fixedText || '').slice(0, 2000),
    });
    return NextResponse.json({ ok });
  }

  if (action === 'delete-review') {
    const pid = String(body.productId || '');
    const list = await getReviews(pid);
    const next = list.filter((r) => r.ts !== Number(body.ts));
    const ok = await insertSettingVersion('estore_reviews_' + pid, next);
    return NextResponse.json({ ok });
  }

  return NextResponse.json({ ok: false, error: 'action' }, { status: 400 });
}
