const BASE = 'https://e-service-tbc-official.vercel.app';
const title = 'Checkout';
const description = 'Complete your TBC × E-store order — confirm your details, then pay with bKash, Nagad, Rocket, Upay or USDT (TRC20) for fast digital delivery.';

export const metadata = {
  title,
  description,
  alternates: { canonical: BASE + '/checkout' },
  openGraph: { title: title + ' — TBC × E-store', description, url: BASE + '/checkout', type: 'website' },
};

export default function CheckoutLayout({ children }) {
  return children;
}
