'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '../../../components/LangContext';
import { usePayCtx, METHOD_LOGOS } from '../../../components/usePayCtx';
import { fmtBdt } from '../../../lib/format';

const DARK = { bkash: '#9e0048', nagad: '#bf2f13', rocket: '#5e2264', upay: '#007a37' };

// Display-only grouping for readability (01894 693 890); copying always uses the raw digits.
const groupNum = (n) => { const d = String(n || '').replace(/\D/g, ''); return d.length === 11 ? d.slice(0, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8) : String(n || ''); };

// Step 3 (manual): one wallet's own page — mirrors Hub Cart's /payment/<brand>
// pages: brand panel, numbered steps, TrxID box, Verify button.
function MethodInner({ methodId }) {
  const { lang, t } = useLang();
  const router = useRouter();
  const { ids, cfg, total } = usePayCtx();
  const [trx, setTrx] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState('');

  const m = cfg ? cfg.methods.find((x) => x.id === methodId) : null;

  if (!ids.length) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>{t.payNoOrder}</div>;
  if (cfg && !m) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>{t.payNoOrder}</div>;
  if (!m) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>...</div>;

  const brand = m.label;
  const fill = (s) => s.replaceAll('{brand}', brand).replaceAll('{dial}', m.dial);

  const copyNumber = async () => {
    try { await navigator.clipboard.writeText(m.number); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const verify = async () => {
    if (!trx.trim()) { setFail(t.payTrxPh); return; }
    setBusy(true);
    setFail('');
    const res = await fetch('/api/order', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: ids, method: brand + ' (Send Money)', trxId: trx.trim() }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    if (d && d.ok) {
      router.push('/order-success?ids=' + ids.join(','));
    } else {
      setFail(d && d.error === 'dup_trx' ? t.payDupTrx.replaceAll('{code}', d.order || '') : t.errorGeneric);
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', padding: '16px 0 46px' }}>
      <div style={{ textAlign: 'center', padding: '14px', background: '#ffffff', borderRadius: '14px', marginBottom: '14px', minHeight: '62px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {METHOD_LOGOS[m.id]
          ? <img src={METHOD_LOGOS[m.id]} alt={brand} style={{ height: '36px', objectFit: 'contain' }} />
          : <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '18px' }}>{brand}</span>}
      </div>

      <div className="glass" style={{ borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '13px', marginBottom: '14px' }}>
        <img src="/icon-192.png" alt="TBC × E-store" style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '10px' }} />
        <span style={{ fontSize: '16px', fontWeight: 800 }}>TBC × E-store</span>
      </div>

      {total != null && (
        <div className="glass" style={{ borderRadius: '14px', padding: '15px 18px', marginBottom: '16px', fontSize: '21px', fontWeight: 900 }}>
          {fmtBdt(total, lang)}
        </div>
      )}

      <div style={{ background: m.color, borderRadius: '16px', padding: '20px 16px', color: '#fff', marginBottom: '18px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 800 }}>{t.payEnterTrx}</h4>
        <input
          type="text"
          placeholder={t.payTrxPh}
          value={trx}
          onChange={(e) => setTrx(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '9px', border: 'none', fontSize: '14px', outline: 'none', color: '#000', marginBottom: '16px', fontFamily: 'inherit' }}
        />
        <div style={{ fontSize: '12.5px', lineHeight: '1.9', opacity: 0.97 }}>
          <div>• {fill(t.payStepDial)}</div>
          <div>• {t.payStepSend}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>• {t.payStepTo} <strong>{groupNum(m.number)}</strong></span>
            <button onClick={copyNumber} style={{ background: '#ffffff', color: m.color, border: 'none', borderRadius: '5px', padding: '2px 9px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied ? t.payCopied : t.payCopy}
            </button>
          </div>
          {total != null && <div>• {t.payStepAmount} <strong>{fmtBdt(total, lang)}</strong></div>}
          <div>• {fill(t.payStepPin)}</div>
          <div>• {t.payStepCopy}</div>
          <div>• {t.payStepVerify}</div>
        </div>
      </div>

      {fail && <p className="err" style={{ marginBottom: '12px' }}>{fail}</p>}
      <button
        onClick={verify}
        disabled={busy}
        style={{ width: '100%', padding: '15px', background: DARK[m.id] || m.color, color: '#fff', border: 'none', borderRadius: '13px', fontWeight: 800, fontSize: '16px', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
      >
        {busy ? t.payVerifying : t.payVerify}
      </button>
    </div>
  );
}

export default function MethodPage({ params }) {
  return (
    <Suspense fallback={null}>
      <MethodInner methodId={params.method} />
    </Suspense>
  );
}
