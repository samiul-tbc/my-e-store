import './globals.css';
import Shell from '../components/Shell';

const BASE = 'https://e-service-tbc-official.vercel.app';
const DEFAULT_TITLE = 'TBC × E-store — Premium E-Services';
const DEFAULT_DESC = 'TBC × E-store — premium digital e-services: 3D birthday cards, bio website source code and more. Secure payment, fast digital delivery.';

export const metadata = {
  metadataBase: new URL(BASE),
  title: { default: DEFAULT_TITLE, template: '%s — TBC × E-store' },
  description: DEFAULT_DESC,
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon-192.png' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'TBC × E-store',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    url: BASE,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07090d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
