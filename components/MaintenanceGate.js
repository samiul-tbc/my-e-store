'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLang } from './LangContext';
import Icon from './icons';
import { LogoMark } from './Logo';
import { useStoreWa } from './useStoreWa';

// Full-screen maintenance overlay for customer pages (admin stays usable).
export default function MaintenanceGate({ children }) {
  const pathname = usePathname();
  const { t } = useLang();
  const storeWa = useStoreWa();
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((d) => { if (d) setMaintenance(!!d.maintenance); })
      .catch(() => {});
  }, [pathname]);

  const isAdmin = pathname && pathname.startsWith('/admin');
  if (!maintenance || isAdmin) return children;

  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '50px 20px', textAlign: 'center' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'center' }}><LogoMark size={64} radius={18} /></div>
        <h1 style={{ fontSize: 'clamp(24px,5vw,34px)', fontWeight: 800, marginTop: '22px', fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{t.maintenanceTitle}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15.5px', lineHeight: 1.8, maxWidth: '440px', margin: '12px auto 0' }}>{t.maintenanceSub}</p>
        <a href={'https://wa.me/' + storeWa} target="_blank" rel="noreferrer" className="btn-lime" style={{ marginTop: '22px' }}>
          <Icon name="message" size={17} />WhatsApp
        </a>
      </div>
    </div>
  );
}
