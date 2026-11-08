import { NextResponse } from 'next/server';
import { getCatalogue } from '../../../lib/catalog-server';
import { validateCoupon } from '../../../lib/coupons-server';
import { sanitizeBday } from '../../../lib/birthday';
import { insertOrder, findOrderByCode, insertSettingVersion, sbFetch } from '../../../lib/supabase';
import { getVipState } from '../../../lib/vip-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const last10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);

async function newOrderCode() {
  for (let i = 0; i < 12; i++) {
    const code = 'ES-' + Math.floor(1000 + Math.random() * 9000);
    const existing = await findOrderByCode(code);
    if (!existing) return code;
  }
  return 'ES-' + Date.now().toString().slice(-6);
}

// POST /api/order — create one pending order row per item.
// { items:[productId], name, phone, telegram, coupon, bday: { [productId]: payload } }
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 80);
  const phone = String(body.phone || '').trim().slice(0, 20);
  const telegram = String(body.telegram || '').trim().slice(0, 60);
  if (!name || last10(phone).length !== 10) {
    return NextResponse.json({ ok: false, error: 'input' }, { status: 400 });
  }
  const catalogue = await getCatalogue();
  const ids = Array.isArray(body.items) ? [...new Set(body.items.map(String))] : [];
  const items = ids.map((id) => catalogue.find((p) => p.id === id)).filter((p) => p && p.published !== false);
  if (!items.length) return NextResponse.json({ ok: false, error: 'items' }, { status: 400 });

  const subtotal = items.reduce((a, p) => a + (Number(p.price) || 0), 0);
  const coupon = await validateCoupon(body.coupon, subtotal);
  // VIP applies only when no coupon is used (coupons take precedence).
  let vipUsed = false;
  let totalDiscount = coupon ? coupon.discount : 0;
  if (!coupon) {
    const vip = await getVipState(phone);
    if (vip.available && subtotal > 0) {
      totalDiscount = Math.round((subtotal * vip.percent) / 100);
      vipUsed = totalDiscount > 0;
    }
  }

  const created = [];
  let remainingDiscount = totalDiscount;
  for (let i = 0; i < items.length; i++) {
    const p = items[i];
    let share = 0;
    if (totalDiscount > 0) {
      share = i === items.length - 1 ? remainingDiscount : Math.round((totalDiscount * (Number(p.price) || 0)) / subtotal);
      remainingDiscount -= share;
    }
    const code = await newOrderCode();
    const row = {
      order_id: code,
      customer_name: name,
      whatsapp_number: phone,
      telegram_username: telegram,
      service_name: p.title,
      price: Math.max(0, (Number(p.price) || 0) - share),
      payment_method: '',
      trx_id: '',
      status: 'pending',
    };
    const ins = await insertOrder(row);
    if (!ins.ok) return NextResponse.json({ ok: false, error: 'db', detail: ins.text ? ins.text.slice(0, 200) : '' }, { status: 500 });
    created.push({ code, title: p.title, price: row.price, productId: p.id });
    // Index marker so admin + sold counts can find this store's orders.
    await insertSettingVersion('estore_ordidx_' + code, { title: p.title, productId: p.id, phone10: last10(phone), ref: String(body.ref || '').replace(/\D/g, '').slice(-10) || undefined, ts: Date.now() });
    // Birthday payload for link-type products.
    if (p.infoForm && body.bday && body.bday[p.id]) {
      await insertSettingVersion('estore_bday_' + code, sanitizeBday(body.bday[p.id]));
    }
  }
  if (vipUsed) await insertSettingVersion('estore_vip_used_' + last10(phone), { ts: Date.now(), orders: created.map((c) => c.code) });
  // Telegram order alert (env-based; silent when not configured).
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;
    if (token && chat) {
      const lines = created.map((c) => `• ${c.code} — ${c.title} — ৳${c.price}`).join('\n');
      const text = `🛍️ New order — TBC × E-store\n${lines}\nTotal: ৳${subtotal - totalDiscount}${totalDiscount ? ` (discount ৳${totalDiscount}${coupon ? ', coupon ' + coupon.code : ', VIP'})` : ''}\nName: ${name}\nPhone: ${phone}${telegram ? '\nTelegram: ' + telegram : ''}`;
      await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text }),
      });
    }
  } catch {}
  return NextResponse.json({
    ok: true,
    vip: vipUsed,
    orders: created,
    subtotal,
    discount: totalDiscount,
    total: subtotal - totalDiscount,
    coupon: coupon ? coupon.code : null,
  });
}

// POST /api/order/pay — attach payment method + TrxID to pending orders.
// { orderIds:[], method, trxId }
export async function PUT(req) {
  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.orderIds) ? body.orderIds.map(String).slice(0, 10) : [];
  const method = String(body.method || '').trim().slice(0, 40);
  const trxId = String(body.trxId || '').trim().slice(0, 60);
  if (!ids.length || !method || !trxId) return NextResponse.json({ ok: false, error: 'input' }, { status: 400 });

  // Duplicate TrxID guard (same rule as Hub Cart): another order already
  // carrying this TrxID means it cannot be reused here.
  const dupRes = await sbFetch('orders?trx_id=ilike.' + encodeURIComponent(trxId) + '&select=order_id&limit=5');
  if (dupRes.ok) {
    const rows = await dupRes.json().catch(() => []);
    const others = (rows || []).filter((r) => !ids.includes(r.order_id));
    if (others.length) return NextResponse.json({ ok: false, error: 'dup_trx', order: others[0].order_id }, { status: 409 });
  }
  for (const code of ids) {
    const res = await sbFetch('orders?order_id=eq.' + encodeURIComponent(code), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ payment_method: method, trx_id: trxId }),
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: 'db' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
