'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '../../components/LangContext';
import { usePayCtx, METHOD_LOGOS, USDT_LOGO } from '../../components/usePayCtx';
import { fmtBdt } from '../../lib/format';

// Step 1 of the payment funnel (mirrors Hub Cart's processedorder page):
// pick Manual Pay or Crypto Pay, then proceed to that flow.
function SelectInner() {
  const { lang, t } = useLang();
  const router = useRouter();
  const { ids, summary, total, usdtAmount, ordersQs } = usePayCtx();
  const [selected, setSelected] = useState('manual');

  if (!ids.length) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>{t.payNoOrder}</div>;

  return (
    <div className="wrap" style={{ padding: '24px 0 46px', maxWidth: '520px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#a6f36a', color: '#10170c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>3</span>
        <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>{t.paySelectTitle}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {/* Manual Pay */}
        <div
          onClick={() => setSelected('manual')}
          style={{
            gridColumn: 'span 2', background: '#ffffff', borderRadius: '16px', cursor: 'pointer', overflow: 'hidden',
            border: selected === 'manual' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            boxShadow: selected === 'manual' ? '0 0 12px rgba(22,163,74,0.4)' : 'none',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}
        >
          <div style={{ background: '#16a34a', color: '#fff', fontSize: '9px', fontWeight: 900, textAlign: 'center', padding: '4px 0', letterSpacing: '0.6px' }}>{t.payRecommended}</div>
          <div style={{ padding: '14px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <img src={METHOD_LOGOS.bkash} alt="bKash" style={{ height: '18px', objectFit: 'contain' }} />
              <img src={METHOD_LOGOS.nagad} alt="Nagad" style={{ height: '18px', objectFit: 'contain' }} />
              <img src={METHOD_LOGOS.rocket} alt="Rocket" style={{ height: '19px', objectFit: 'contain' }} />
              <img src={METHOD_LOGOS.upay} alt="Upay" style={{ height: '17px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#15803d' }}>{t.payManualPay}</span>
          </div>
          <div style={{ background: '#dcfce7', padding: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#166534' }}>{t.paySendMoneyLine}</div>
        </div>

        {/* Crypto Pay */}
        <div
          onClick={() => setSelected('crypto')}
          style={{
            gridColumn: 'span 2', background: '#ffffff', borderRadius: '16px', cursor: 'pointer', overflow: 'hidden',
            border: selected === 'crypto' ? '2px solid #ff7a00' : '1px solid #e2e8f0',
            boxShadow: selected === 'crypto' ? '0 0 12px rgba(255,122,0,0.3)' : 'none',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}
        >
          <div style={{ padding: '16px 4px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={USDT_LOGO} alt="USDT" style={{ height: '24px', width: '24px', marginBottom: '6px' }} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>{t.payCryptoPay}</span>
          </div>
          <div style={{ background: '#f1f5f9', padding: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#475569' }}>{t.payBybitLine}</div>
        </div>
      </div>

      {/* Order summary */}
      <div className="glass" style={{ borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
        {summary && summary.titles && (
          <p style={{ color: '#cbd5e1', fontSize: '13.5px', fontWeight: 600, margin: '0 0 10px' }}>{summary.titles.join(' + ')}</p>
        )}
        <p style={{ color: 'var(--muted)', fontSize: '12.5px', margin: '0 0 8px' }}>Order: {ids.join(', ')}</p>
        {total != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#cbd5e1' }}>
            <span>{t.total}</span>
            <span style={{ fontWeight: 800, color: '#f8fafc' }}>
              {fmtBdt(total, lang)}
              {selected === 'crypto' && usdtAmount ? ` (≈ $${usdtAmount} USDT)` : ''}
            </span>
          </div>
        )}
      </div>

      <button
        className="btn-lime"
        style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '16px', fontWeight: 900, background: selected === 'crypto' ? 'linear-gradient(135deg,#f59e0b,#f97316)' : undefined, color: selected === 'crypto' ? '#1c1005' : undefined, border: 'none', cursor: 'pointer', borderRadius: '14px' }}
        onClick={() => router.push(selected === 'crypto' ? '/payment/crypto?' + ordersQs : '/payment/manual?' + ordersQs)}
      >
        {selected === 'crypto' ? (usdtAmount ? `Pay $${usdtAmount} USDT (Crypto)` : t.payCryptoPay) : t.payManualPay}
      </button>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <SelectInner />
    </Suspense>
  );
}
