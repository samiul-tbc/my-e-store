const BASE = 'https://e-service-tbc-official.vercel.app';
const title = 'Your Cart';
const description = 'Review the services in your TBC × E-store cart and check out securely — pay with bKash, Nagad, Rocket, Upay or USDT (TRC20).';

export const metadata = {
  title,
  description,
  alternates: { canonical: BASE + '/cart' },
  openGraph: { title: title + ' — TBC × E-store', description, url: BASE + '/cart', type: 'website' },
};

export default function CartLayout({ children }) {
  return children;
}
