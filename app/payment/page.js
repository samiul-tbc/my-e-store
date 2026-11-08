'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLang } from '../../components/LangContext';
import Icon from '../../components/icons';

function PaymentInner() {
  const { t } = useLang();
  const router = useRouter();
  const sp = useSearchParams();
  const ids = (sp.get('orders') || '').split(',').filter(Boolean);
  const [cfg, setCfg] = useState(null);
  const [summary, setSummary] = useState(null);
  const [method, setMethod] = useState('bkash');
  const [trx, setTrx] = useState('');
  const [copied, setCopied] = useState('');
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState('');

  useEffect(() => {
    fetch('/api/payments').then((r) => r.json()).then(setCfg).catch(() => {});
    try {
      const s = JSON.parse(localStorage.getItem('tbcx_last_order') || 'null');
      if (s) setSummary(s);
    } catch {}
  }, []);

  const total = summary && summary.ids && ids.every((i) => summary.ids.includes(i)) ? summary.total : null;
  const isCrypto = method === 'crypto';
  const m = cfg ? cfg.methods.find((x) => x.id === method) : null;
  const usdtAmount = total != null && cfg ? (total / cfg.usdtRate).toFixed(2) : null;

  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1600); } catch {}
  };

  const submit = async () => {
    if (!trx.trim()) { setFail(t.trxPh); return; }
    setBusy(true);
    setFail('');
    const res = await fetch('/api/order', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: ids, method: isCrypto ? 'Crypto (USDT)' : (m ? m.label : method), trxId: trx.trim() }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    if (d && d.ok) {
      router.push('/order-success?ids=' + ids.join(','));
    } else {
      setFail(d && d.error === 'dup_trx' ? `TrxID already used — order ${d.order || ''}` : t.errorGeneric);
      setBusy(false);
    }
  };

  if (!ids.length) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>{t.trackNotFound}</div>;

  return (
    <div className="wrap" style={{ padding: '28px 0 46px', maxWidth: '640px' }}>
      <h1 className="section-title">{t.payTitle}</h1>
      <p className="section-sub">{t.paySub}</p>
      {total != null && (
        <div className="glass" style={{ padding: '15px 18px', marginTop: '18px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px' }}>
          <span>{t.total}</span><span style={{ color: 'var(--accent)' }}>৳{total}</span>
        </div>
      )}
      <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '10px' }}>Order: {ids.join(', ')}</p>

      <div style={{ display: 'grid', gap: '10px', marginTop: '18px' }}>
        {(cfg ? cfg.methods : []).map((x) => (
          <button key={x.id} className={'pay-card' + (method === x.id ? ' on' : '')} onClick={() => setMethod(x.id)}>
            <span style={{ width: '42px', height: '42px', borderRadius: '12px', background: x.color + '22', border: `1px solid ${x.color}55`, display: 'grid', placeItems: 'center', color: x.color, fontWeight: 800, fontFamily: "'Manrope',sans-serif", fontSize: '15px' }}>{x.label[0]}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 800, fontSize: '15.5px' }}>{x.label}</span>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '12.5px' }}>{t.payManual} — {x.dial}</span>
            </span>
            <span style={{ width: '20px', height: '20px', borderRadius: '999px', border: method === x.id ? '6px solid #a6f36a' : '2px solid #334155', display: 'inline-block' }} />
          </button>
        ))}
        <button className={'pay-card' + (isCrypto ? ' on' : '')} onClick={() => setMethod('crypto')}>
          <span style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(38,161,123,0.13)', border: '1px solid rgba(38,161,123,0.4)', display: 'grid', placeItems: 'center', color: '#26a17b', fontWeight: 800, fontFamily: "'Manrope',sans-serif", fontSize: '15px' }}>₮</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '15.5px' }}>USDT (TRC20)</span>
            <span style={{ display: 'block', color: 'var(--muted)', fontSize: '12.5px' }}>{t.payCrypto} — {t.usdtRate}</span>
          </span>
          <span style={{ width: '20px', height: '20px', borderRadius: '999px', border: isCrypto ? '6px solid #a6f36a' : '2px solid #334155', display: 'inline-block' }} />
        </button>
      </div>

      {cfg && !isCrypto && m && (
        <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '16px' }}>
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 700 }}>{m.label} {t.payNumber} (Send Money)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <span style={{ fontFamily: "'Manrope',monospace", fontWeight: 800, fontSize: '21px', letterSpacing: '0.5px' }}>{m.number}</span>
            <button className="btn-ghost" style={{ padding: '8px 13px', fontSize: '13px' }} onClick={() => copy(m.number, 'num')}>
              <Icon name={copied === 'num' ? 'check' : 'copy'} size={14} />{copied === 'num' ? t.payCopied : t.payCopy}
            </button>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '9px' }}>USSD: {m.dial}</p>
        </div>
      )}

      {cfg && isCrypto && (
        <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '16px' }}>
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 700 }}>{t.usdtAddr}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13.5px', wordBreak: 'break-all', flex: 1, minWidth: '220px' }}>{cfg.usdtAddress}</span>
            <button className="btn-ghost" style={{ padding: '8px 13px', fontSize: '13px' }} onClick={() => copy(cfg.usdtAddress, 'addr')}>
              <Icon name={copied === 'addr' ? 'check' : 'copy'} size={14} />{copied === 'addr' ? t.payCopied : t.payCopy}
            </button>
          </div>
          {usdtAmount && <p style={{ color: 'var(--accent)', fontWeight: 800, marginTop: '10px', fontSize: '15px' }}>≈ ${usdtAmount} USDT</p>}
        </div>
      )}

      <div style={{ marginTop: '18px' }}>
        <label className="lbl">{t.trxPh} *</label>
        <input className="inp" value={trx} onChange={(e) => setTrx(e.target.value)} placeholder={isCrypto ? 'TxHash' : '9XXXXXXXXX'} />
        {fail && <p className="err">{fail}</p>}
      </div>
      <button className="btn-lime" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={submit} disabled={busy || !cfg}>
        <Icon name="check" size={17} />{busy ? t.processing : t.payDone}
      </button>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentInner />
    </Suspense>
  );
}
