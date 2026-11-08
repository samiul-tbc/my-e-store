'use client';
import { usePathname } from 'next/navigation';
import Icon from './icons';
import { useStoreWa } from './useStoreWa';

// Floating liquid-glass WhatsApp button (hidden on funnel/admin pages).
const HIDE_ON = ['/admin', '/checkout', '/payment', '/order-success', '/service/'];

export default function WhatsFloat() {
  const pathname = usePathname();
  const storeWa = useStoreWa();
  if (pathname && HIDE_ON.some((p) => pathname === p || pathname.startsWith(p))) return null;
  return (
    <a
      href={"https://wa.me/" + storeWa}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      style={{
        position: 'fixed', right: '16px', bottom: '96px', zIndex: 49,
        width: '52px', height: '52px', borderRadius: '999px',
        background: 'linear-gradient(180deg, rgba(37,211,102,0.28), rgba(18,140,72,0.3))',
        border: '1px solid rgba(37,211,102,0.5)',
        backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 12px 28px rgba(0,0,0,0.45)',
        display: 'grid', placeItems: 'center', color: '#4be07f',
      }}
    >
      <Icon name="message" size={24} />
    </a>
  );
}
