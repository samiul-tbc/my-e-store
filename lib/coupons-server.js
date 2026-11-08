import { fetchSetting, parseJson } from './supabase';

// Coupons live in settings `estore_coupons`: [{ code, percent, active }]
export async function getCoupons() {
  const raw = await fetchSetting('estore_coupons');
  const parsed = parseJson(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function validateCoupon(code, subtotal) {
  const c = String(code || '').trim().toUpperCase();
  if (!c || !(subtotal > 0)) return null;
  const list = await getCoupons();
  const found = list.find((x) => x && String(x.code || '').toUpperCase() === c && x.active !== false);
  if (!found) return null;
  const percent = Math.max(1, Math.min(90, Number(found.percent) || 0));
  if (!percent) return null;
  return { code: c, percent, discount: Math.round((subtotal * percent) / 100) };
}
