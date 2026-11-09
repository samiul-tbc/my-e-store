'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLang } from '../../components/LangContext';
import Icon from '../../components/icons';
import Confetti from '../../components/Confetti';

function SuccessInner() {
  const { t } = useLang();
  const sp = useSearchParams();
  const ids = (sp.get('ids') || '').split(',').filter(Boolean);
  return (
    <div className="wrap" style={{ padding: '46px 0 60px', maxWidth: '560px', textAlign: 'center' }}>
      <Confetti />
      <span style={{ width: '74px', height: '74px', borderRadius: '999px', background: 'rgba(166,243,106,0.12)', border: '1px solid rgba(166,243,106,0.45)', display: 'inline-grid', placeItems: 'center', color: '#a6f36a' }}>
        <Icon name="check" size={36} strokeWidth={2.6} />
      </span>
      <h1 style={{ fontSize: 'clamp(24px,5vw,32px)', fontWeight: 800, marginTop: '20px', fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{t.orderPlaced}</h1>
      <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.75, marginTop: '10px' }}>{t.orderPlacedSub}</p>
      <div className="glass" style={{ padding: '18px', marginTop: '22px', borderRadius: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.6px' }}>{t.yourOrderId}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '9px' }}>
          {ids.map((id) => (
            <span key={id} style={{ fontFamily: "'Manrope',monospace", fontWeight: 800, fontSize: '19px', color: '#a6f36a', background: 'rgba(166,243,106,0.08)', border: '1px dashed rgba(166,243,106,0.45)', padding: '7px 14px', borderRadius: '11px' }}>{id}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '22px' }}>
        <Link href={'/track' + (ids[0] ? '?q=' + encodeURIComponent(ids[0]) : '')} className="btn-lime">
          <Icon name="package" size={17} />{t.goTrack}
        </Link>
        {ids[0] && (
          <Link href={'/invoice/' + encodeURIComponent(ids[0])} className="btn-ghost">
            <Icon name="doc" size={16} />{t.invoice}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
