import { getCatalogue } from '../lib/catalog-server';

export default async function sitemap() {
  const base = 'https://e-service-tbc-official.vercel.app';
  const products = await getCatalogue().catch(() => []);
  const now = new Date();
  const urls = [
    { url: base + '/', lastModified: now },
    { url: base + '/track', lastModified: now },
    { url: base + '/cart', lastModified: now },
    { url: base + '/guide', lastModified: now },
  ];
  for (const p of products) {
    if (p.published === false) continue;
    urls.push({ url: base + '/service/' + p.id, lastModified: now });
  }
  return urls;
}
