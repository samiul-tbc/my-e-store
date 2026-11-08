import { sbFetch } from './supabase';

const last10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);

// VIP loyalty — Samiul's rule (same as Hub Cart): every 3 completed orders
// earns 5% off the NEXT order once; then it re-earns after 3 more.
export async function getVipState(phone) {
  const p10 = last10(phone);
  if (p10.length !== 10) return { completed: 0, available: false, remaining: 3 };
  let completed = 0;
  try {
    const res = await sbFetch('orders?whatsapp_number=like.%25' + p10 + '&status=eq.completed&select=id&limit=500');
    if (res.ok) completed = (await res.json()).length;
  } catch {}
  let used = 0;
  try {
    const res = await sbFetch('site_settings?key=like.estore_vip_used_' + p10 + '_*&select=key&limit=100');
    if (res.ok) used = (await res.json()).length;
  } catch {}
  const earned = Math.floor(completed / 3);
  const available = earned > used;
  const intoCycle = completed % 3;
  return { completed, used, available, remaining: available ? 0 : 3 - intoCycle, percent: 5 };
}
