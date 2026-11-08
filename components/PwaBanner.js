'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLang } from './LangContext';
import Icon from './icons';
import { LogoMark } from './Logo';

// PWA install banner: shows when the browser offers installation, once per
// dismissal (30 days), liquid-glass style.
export default function PwaBanner() {
  const { t } = useLang();
  const pathname = usePathname();
  const [evt, setEvt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = 0;
    try { dismissed = Number(localStorage.getItem('tbcx_pwa_dismissed') || 0); } catch {}
    if (Date.now() - dismissed < 30 * 86400000) return undefined;
    const onPrompt = (e) => { e.preventDefault(); setEvt(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!show || !evt) return null;
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname.startsWith('/payment'))) return null;

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem('tbcx_pwa_dismissed', String(Date.now())); } catch {}
  };

  return (
    <div style={{
      position: 'fixed', left: '12px', right: '12px', bottom: '92px', zIndex: 48,
      maxWidth: '520px', margin: '0 auto', padding: '14px 16px', borderRadius: '18px',
      background: 'linear-gradient(180deg, rgba(20,28,44,0.82), rgba(10,14,22,0.78))',
      border: '1px solid rgba(166,243,106,0.35)', backdropFilter: 'blur(20px) saturate(170%)',
      WebkitBackdropFilter: 'blur(20px) saturate(170%)', boxShadow: '0 18px 42px rgba(0,0,0,0.5)',
      display: 'flex', gap: '13px', alignItems: 'center',
    }}>
      <LogoMark size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '14px' }}>{t.installTitle}</div>
        <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '2px', lineHeight: 1.5 }}>{t.installSub}</div>
      </div>
      <button className="btn-lime" style={{ padding: '9px 15px', fontSize: '13px' }} onClick={async () => { try { await evt.prompt(); } catch {} dismiss(); }}>
        {t.installBtn}
      </button>
      <button onClick={dismiss} aria-label="close" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
        <Icon name="x" size={17} />
      </button>
    </div>
  );
}
