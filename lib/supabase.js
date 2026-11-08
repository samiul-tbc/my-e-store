// Supabase REST access for TBC x E-store — same project as Hub Cart, with all
// E-Store data namespaced (estore_ prefix) so nothing mixes with Hub Cart.
// site_settings has an RLS quirk on this project: UPDATEs of existing rows are
// rejected with the publishable key, so every save is a versioned INSERT and
// readers take the newest version (same pattern as Hub Cart's settings-store).

const SUPABASE_URL = 'https://mieygzqgoekinxppdepb.supabase.co';
const FALLBACK_KEY = 'sb_publishable_niGVYwUfliF0u39aH2vOHQ_LEhuh6xP';

export function sbKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
}

export async function sbFetch(path, opts = {}) {
  const key = sbKey();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  headers['apikey'] = key;
  headers['Authorization'] = 'Bearer ' + key;
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, { ...opts, headers, cache: 'no-store' });
  return res;
}

// ---- versioned settings (INSERT-only writes) ----

export function pickLatestSetting(rows, baseKey) {
  if (!Array.isArray(rows)) return null;
  let best = null;
  let bestTs = -1;
  for (const r of rows) {
    if (!r || typeof r.key !== 'string') continue;
    if (r.key === baseKey) { if (best === null) best = r; continue; }
    if (r.key.startsWith(baseKey + '_')) {
      const ts = Number(r.key.slice(baseKey.length + 1));
      if (Number.isFinite(ts) && ts > bestTs) { bestTs = ts; best = r; }
    }
  }
  return best;
}

export async function fetchSetting(baseKey) {
  try {
    const res = await sbFetch('site_settings?key=like.' + encodeURIComponent(baseKey) + '*&select=key,value&order=key.desc&limit=60');
    if (!res.ok) return null;
    const rows = await res.json();
    const row = pickLatestSetting(rows, baseKey);
    return row ? row.value : null;
  } catch { return null; }
}

export async function insertSettingVersion(baseKey, value) {
  const key = baseKey + '_' + Date.now();
  const res = await sbFetch('site_settings', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ key, value: typeof value === 'string' ? value : JSON.stringify(value) }),
  });
  return res.ok;
}

export function parseJson(v, fallback) {
  if (v == null) return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
}

// ---- orders table (shared with Hub Cart; E-Store orders use ES-#### ids) ----

export async function insertOrder(row) {
  const res = await sbFetch('orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  if (!res.ok) return { ok: false, status: res.status, text: await res.text().catch(() => '') };
  const data = await res.json().catch(() => []);
  return { ok: true, order: Array.isArray(data) ? data[0] : data };
}

export async function findOrderByCode(code) {
  const res = await sbFetch('orders?order_id=eq.' + encodeURIComponent(code) + '&select=*&limit=1');
  if (!res.ok) return null;
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

export async function listOrdersByIds(codes) {
  if (!codes || !codes.length) return [];
  const inList = codes.map((c) => '"' + String(c).replace(/"/g, '') + '"').join(',');
  const res = await sbFetch('orders?order_id=in.(' + inList + ')&select=*&order=created_at.desc&limit=300');
  if (!res.ok) return [];
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

export async function updateOrderStatus(id, status) {
  const res = await sbFetch('orders?id=eq.' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status }),
  });
  return res.ok;
}
