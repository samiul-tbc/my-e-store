const BASE = 'https://e-service-tbc-official.vercel.app';
const title = 'Guide — How It Works';
const description = 'How TBC × E-store works: choose a service, place your order, pay with bKash, Nagad, Rocket, Upay or USDT (TRC20), and receive fast digital delivery.';

export const metadata = {
  title,
  description,
  alternates: { canonical: BASE + '/guide' },
  openGraph: { title: title + ' — TBC × E-store', description, url: BASE + '/guide', type: 'website' },
};

export default function GuideLayout({ children }) {
  return children;
}
