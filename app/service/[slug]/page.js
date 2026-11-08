import ServiceView from '../../../components/ServiceView';
import { getProduct } from '../../../lib/catalog-server';

export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug);
  if (!p) return { title: 'TBC × E-store' };
  const desc = (p.tagline && (p.tagline.en || p.tagline.bn)) || '';
  return {
    title: p.title + ' — TBC × E-store',
    description: desc,
    openGraph: {
      title: p.title + ' — TBC × E-store',
      description: desc,
      images: ['/api/og?title=' + encodeURIComponent(p.title) + '&price=' + encodeURIComponent(String(p.price))],
      type: 'website',
    },
  };
}

export default async function ServicePage({ params }) {
  const p = await getProduct(params.slug);
  const jsonLd = p ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: (p.tagline && (p.tagline.en || p.tagline.bn)) || '',
    image: p.image,
    offers: { '@type': 'Offer', priceCurrency: 'BDT', price: p.price, availability: 'https://schema.org/InStock' },
    brand: { '@type': 'Brand', name: 'TBC × E-store' },
  } : null;
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ServiceView params={params} />
    </>
  );
}
