import { NextResponse } from 'next/server';
import { getCatalogue, reviewStats } from '../../../lib/catalog-server';
import { fetchSetting, parseJson, sbFetch } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function soldCounts() {
  try {
    const res = await sbFetch('site_settings?key=like.estore_ordidx_*&select=key,value&limit=1000');
    if (!res.ok) return {};
    const rows = await res.json();
    const markerByCode = {};
    for (const r of rows || []) {
      const v = parseJson(r.value, null);
      const code = String(r.key || '').replace('estore_ordidx_', '').replace(/_\d+$/, '');
      if (v && v.title && code) markerByCode[code] = v.title;
    }
    const codes = Object.keys(markerByCode);
    if (!codes.length) return {};
    // "Sold" means a completed order — verify against the orders table so
    // cancelled/pending/test markers never inflate the count.
    const counts = {};
    const inList = codes.map((c) => '"' + c.replace(/"/g, '') + '"').join(',');
    const ores = await sbFetch('orders?order_id=in.(' + inList + ')&status=eq.completed&select=order_id&limit=1000');
    if (ores.ok) {
      const orows = await ores.json().catch(() => []);
      for (const o of orows || []) {
        const title = markerByCode[o.order_id];
        if (title) counts[title] = (counts[title] || 0) + 1;
      }
    }
    return counts;
  } catch { return {}; }
}

// Public catalogue + announcement + sold counts for the storefront.
export async function GET() {
  const [products, announcementRaw, sold] = await Promise.all([
    getCatalogue(),
    fetchSetting('estore_announcement'),
    soldCounts(),
  ]);
  const out = [];
  for (const p of products) {
    if (p.published === false) continue;
    const stats = await reviewStats(p.id);
    out.push({
      id: p.id,
      title: p.title,
      price: p.price,
      oldPrice: p.oldPrice || 0,
      image: p.image,
      images: Array.isArray(p.images) && p.images.length ? p.images : [p.image],
      type: p.type,
      infoForm: !!p.infoForm,
      featured: !!p.featured,
      tagline: p.tagline,
      bullets: p.bullets,
      rating: stats.rating,
      reviewCount: stats.count,
      sold: sold[p.title] || 0,
      hasDownload: p.type === 'download',
    });
  }
  out.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return NextResponse.json(
    { products: out, announcement: typeof announcementRaw === 'string' ? announcementRaw : '' },
    { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40' } }
  );
}
