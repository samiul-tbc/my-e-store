'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '../../../components/LangContext';
import Icon from '../../../components/icons';
import { usePayCtx, METHOD_LOGOS } from '../../../components/usePayCtx';
import { fmtBdt } from '../../../lib/format';

// Step 2 (manual): pick the wallet — mirrors Hub Cart's /payment list page.
function ManualInner() {
  const { lang, t } = useLang();
  const router = useRouter();
  const { ids, cfg, total, ordersQs } = usePayCtx();

  if (!ids.length) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>{t.payNoOrder}</div>;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e2e8f0', display: 'inline-flex' }} aria-label="home">
          <Icon name="home" size={19} />
        </button>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '17px' }} aria-label="close">✕</button>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0 14px' }}>
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden' }}>
          <img src="/icon-192.png" alt="TBC × E-store" style={{ width: '58px', height: '58px', objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px' }}>TBC × E-store</h2>
        {total != null && (
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
            {t.payPayable} <strong style={{ color: '#a6f36a' }}>{fmtBdt(total, lang)}</strong>
          </span>
        )}
      </div>

      <div style={{ background: '#a6f36a', color: '#10170c', padding: '10px 16px', textAlign: 'center', fontWeight: 800, fontSize: '14px', borderRadius: '9px', marginBottom: '16px' }}>
        {t.payMobileBanking}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {(cfg ? cfg.methods : []).map((m) => (
          <Link
            key={m.id}
            href={'/payment/' + m.id + '?' + ordersQs}
            style={{
              background: '#ffffff', border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: '16px',
              height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px',
            }}
          >
            {METHOD_LOGOS[m.id]
              ? <img src={METHOD_LOGOS[m.id]} alt={m.label} style={{ maxHeight: '36px', maxWidth: '100%', objectFit: 'contain' }} />
              : <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>{m.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ManualListPage() {
  return (
    <Suspense fallback={null}>
      <ManualInner />
    </Suspense>
  );
}
