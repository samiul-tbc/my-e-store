const BASE = 'https://e-service-tbc-official.vercel.app';
const title = 'Track Your Order';
const description = 'Track your TBC × E-store order status with your ES order code or phone number — and get your delivery (birthday card link or source file download) as soon as payment is confirmed.';

export const metadata = {
  title,
  description,
  alternates: { canonical: BASE + '/track' },
  openGraph: { title: title + ' — TBC × E-store', description, url: BASE + '/track', type: 'website' },
};

export default function TrackLayout({ children }) {
  return children;
}
