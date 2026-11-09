const BASE = 'https://e-service-tbc-official.vercel.app';
const title = 'My Profile';
const description = 'Your TBC × E-store profile — your orders, loyalty progress and referral link in one place.';

export const metadata = {
  title,
  description,
  alternates: { canonical: BASE + '/profile' },
  openGraph: { title: title + ' — TBC × E-store', description, url: BASE + '/profile', type: 'website' },
};

export default function ProfileLayout({ children }) {
  return children;
}
