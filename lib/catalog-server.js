import { fetchSetting, parseJson } from './supabase';
import { SEED_PRODUCTS } from './services';

// Server-side catalogue: admin-saved version (settings `estore_products`)
// wins; the seed in lib/services.js is the fallback.
export async function getCatalogue() {
  const raw = await fetchSetting('estore_products');
  const parsed = parseJson(raw, null);
  if (Array.isArray(parsed) && parsed.length) return parsed;
  return SEED_PRODUCTS;
}

export async function getProduct(id) {
  const all = await getCatalogue();
  return all.find((p) => p.id === id) || null;
}

export async function getReviews(productId) {
  const raw = await fetchSetting('estore_reviews_' + productId);
  const parsed = parseJson(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function reviewStats(productId) {
  const list = await getReviews(productId);
  if (!list.length) return { rating: 0, count: 0 };
  const sum = list.reduce((a, r) => a + (Number(r.rating) || 0), 0);
  return { rating: Math.round((sum / list.length) * 10) / 10, count: list.length };
}
