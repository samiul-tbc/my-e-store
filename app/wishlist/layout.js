const BASE = 'https://e-service-tbc-official.vercel.app';
const title = 'Wishlist';
const description = 'Your saved TBC × E-store services — birthday wish cards, bio website source code and more, ready to order anytime.';

export const metadata = {
  title,
  description,
  alternates: { canonical: BASE + '/wishlist' },
  openGraph: { title: title + ' — TBC × E-store', description, url: BASE + '/wishlist', type: 'website' },
};

export default function WishlistLayout({ children }) {
  return children;
}
