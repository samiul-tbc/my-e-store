'use client';
import './globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LangProvider, useLang } from '../components/LangContext';
import Icon from '../components/icons';
import Logo from '../components/Logo';
import LiquidSeg from '../components/LiquidSeg';
import BottomNav from '../components/BottomNav';
import SwRegister from '../components/SwRegister';
import WhatsFloat from '../components/WhatsFloat';
import RefCapture from '../components/RefCapture';
import { useStoreWa } from '../components/useStoreWa';
import PwaBanner from '../components/PwaBanner';
import MaintenanceGate from '../components/MaintenanceGate';
import ScrollProgress from '../components/ScrollProgress';
import { readCart } from '../lib/cart';

function AnnouncementBar() {
  const [text, setText] = useState('');
  const [endsAt, setEndsAt] = useState(null);
  const [left, setLeft] = useState('');
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => { if (d) { if (d.announcement) setText(d.announcement); if (d.announcementEndsAt) setEndsAt(d.announcementEndsAt); } })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!endsAt) return undefined;
    const tick = () => {
      const ms = new Date(endsAt).getTime() - Date.now();
      if (ms <= 0) { setLeft(''); return; }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setLeft((d > 0 ? d + 'd ' : '') + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0'));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [endsAt]);
  if (!text) return null;
  return (
    <div style={{ background: 'linear-gradient(90deg, rgba(166,243,106,0.16), rgba(166,243,106,0.07))', borderBottom: '1px solid rgba(166,243,106,0.25)', color: '#d9f99d', fontSize: '13px', fontWeight: 600, textAlign: 'center', padding: '8px 14px' }}>
      {text}
      {left && <span style={{ marginLeft: '10px', background: 'rgba(7,10,14,0.55)', border: '1px solid rgba(166,243,106,0.4)', padding: '2px 9px', borderRadius: '999px', fontFamily: "'Manrope',monospace", fontWeight: 800, fontSize: '12px' }}>{left}</span>}
    </div>
  );
}

function Header() {
  const { lang, t, toggle } = useLang();
  const [cartN, setCartN] = useState(0);
  useEffect(() => {
    const sync = () => setCartN(readCart().length);
    sync();
    window.addEventListener('tbcx-cart-changed', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('tbcx-cart-changed', sync); window.removeEventListener('storage', sync); };
  }, []);
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,9,13,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--line)' }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 0' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Logo size={37} />
        </Link>
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/#services" className="hdr-link">{t.navServices}</Link>
          <Link href="/track" className="hdr-link">{t.navTrack}</Link>
          <Link href="/cart" aria-label={t.navCart} style={{ position: 'relative', display: 'inline-flex', color: '#e2e8f0', textDecoration: 'none', padding: '6px' }}>
            <Icon name="cart" size={21} />
            {cartN > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, minWidth: '17px', height: '17px', borderRadius: '999px', display: 'grid', placeItems: 'center', padding: '0 4px', border: '2px solid #0b0f16' }}>{cartN}</span>
            )}
          </Link>
          <LiquidSeg
            options={[{ value: 'bn', label: 'বাংলা' }, { value: 'en', label: 'EN' }]}
            value={lang}
            onChange={(v) => { if (v !== lang) toggle(); }}
            height={32}
            fontSize={12}
          />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useLang();
  const storeWa = useStoreWa();
  return (
    <footer style={{ borderTop: '1px solid var(--line)', marginTop: '70px', padding: '30px 0 110px' }}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Logo size={34} />
          <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '10px' }}>{t.footerTag}</div>
          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '3px' }}>© {new Date().getFullYear()} TBC × E-store — {t.brandSub}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <Link href="/track" style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>{t.trackTitle}</Link>
          <Link href="/#faq" style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>{t.navFaq}</Link>
          <Link href="/guide" style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>{t.guideTitle}</Link>
          <Link href="/wishlist" style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>{t.wishTitle}</Link>
          <a href={"https://wa.me/" + storeWa} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#a6f36a', textDecoration: 'none', fontWeight: 700 }}>
            <Icon name="message" size={16} /> WhatsApp: {storeWa.startsWith('880') ? '0' + storeWa.slice(3) : storeWa}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <title>TBC × E-store — Premium E-Services</title>
        <meta name="description" content="TBC × E-store — premium digital e-services: 3D birthday cards, bio website source code and more. Secure payment, fast digital delivery." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#07090d" />
      </head>
      <body>
        <LangProvider>
          <ScrollProgress />
          <AnnouncementBar />
          <Header />
          <MaintenanceGate><main>{children}</main></MaintenanceGate>
          <Footer />
          <WhatsFloat />
          <PwaBanner />
          <BottomNav />
          <SwRegister />
          <RefCapture />
        </LangProvider>
      </body>
    </html>
  );
}
