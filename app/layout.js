'use client';
import './globals.css';
import Link from 'next/link';
import { LangProvider, useLang } from '../components/LangContext';
import Icon from '../components/icons';

function Header() {
  const { lang, t, toggle } = useLang();
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,9,13,0.72)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--line)' }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '13px 0' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#b8f77e,#8fdd4e)', display: 'grid', placeItems: 'center', color: '#10170c' }}>
            <Icon name="globe" size={20} strokeWidth={2.4} />
          </span>
          <span style={{ lineHeight: 1.1 }}>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '17px', fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{t.brand}</span>
            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--muted)', letterSpacing: '0.6px' }}>{t.brandSub}</span>
          </span>
        </Link>
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/#services" style={{ textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>{t.navServices}</Link>
          <Link href="/#how" style={{ textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>{t.navHow}</Link>
          <Link href="/#faq" style={{ textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>{t.navFaq}</Link>
          <button onClick={toggle} aria-label="Language" style={{ background: 'rgba(166,243,106,0.1)', border: '1px solid rgba(166,243,106,0.35)', color: 'var(--accent)', fontWeight: 800, fontSize: '12.5px', padding: '7px 13px', borderRadius: '999px', cursor: 'pointer' }}>
            {lang === 'bn' ? 'EN' : 'বাংলা'}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ borderTop: '1px solid var(--line)', marginTop: '70px', padding: '28px 0 90px' }}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px' }}>© {new Date().getFullYear()} {t.brand} — {t.brandSub}</div>
          <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>{t.footerTag}</div>
        </div>
        <a href="https://wa.me/8801319760720" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#a6f36a', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
          <Icon name="message" size={16} /> WhatsApp: 01319-760720
        </a>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <title>E-Store — Premium E-Services</title>
        <meta name="description" content="Premium digital e-services: 3D birthday cards, bio website source code and more — secure payment, fast digital delivery." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <LangProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
