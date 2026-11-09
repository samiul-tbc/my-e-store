'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '../../../components/LangContext';
import { usePayCtx, USDT_LOGO, BYBIT_LOGO } from '../../../components/usePayCtx';
import { fmtBdt } from '../../../lib/format';

// Crypto flow — mirrors Hub Cart's /crypto-pay: QR + TRC20 address + TxID.
function CryptoInner() {
  const { lang, t } = useLang();
  const router = useRouter();
  const { ids, cfg, total, usdtAmount } = usePayCtx();
  const [trx, setTrx] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState('');

  if (!ids.length) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>{t.payNoOrder}</div>;
  if (!cfg) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>...</div>;

  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(cfg.usdtAddress);

  const copyAddr = async () => {
    try { await navigator.clipboard.writeText(cfg.usdtAddress); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {}
  };

  const confirm = async () => {
    if (!trx.trim()) { setFail(t.payTxLabel); return; }
    setBusy(true);
    setFail('');
    const res = await fetch('/api/order', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: ids, method: 'Crypto (USDT TRC20)', trxId: trx.trim() }),
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
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 0 46px' }}>
      <div className="glass" style={{ borderRadius: '20px', padding: '18px 16px', marginBottom: '16px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', marginBottom: '8px' }}>
          <img src={BYBIT_LOGO} alt="Bybit" style={{ height: '22px', borderRadius: '4px' }} />
          <img src={USDT_LOGO} alt="USDT" style={{ height: '22px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{t.payUsdtTitle}</h2>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{t.payUsdtSub}</p>
        {total != null && usdtAmount && (
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(30,41,59,0.7)', borderRadius: '14px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.payTotalPayable}</span>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#a6f36a' }}>
              ${usdtAmount} USDT <span style={{ fontSize: '13px', color: '#94a3b8' }}>({fmtBdt(total, lang)})</span>
            </div>
          </div>
        )}
      </div>

      <div className="glass" style={{ borderRadius: '20px', padding: '18px 16px', marginBottom: '16px', textAlign: 'center', border: '1px solid rgba(166,243,106,0.25)' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#a6f36a', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>{t.payNetwork}</span>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '16px', display: 'inline-block', marginBottom: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <img src={qrUrl} alt="USDT TRC20 QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
        </div>
        <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>{t.payDepositAddr}</span>
          <div style={{ fontSize: '12.5px', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '10px', color: '#f8fafc' }}>{cfg.usdtAddress}</div>
          <button
            type="button"
            onClick={copyAddr}
            style={{ width: '100%', background: copied ? '#16a34a' : 'linear-gradient(135deg,#a6f36a,#d2ffad)', color: '#10170c', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {copied ? t.payCopiedAddr : t.payCopyAddr}
          </button>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: '20px', padding: '16px' }}>
        <label className="lbl">{t.payTxLabel} *</label>
        <input className="inp" type="text" placeholder="e.g. e6d78a9c... or Internal Transfer ID" value={trx} onChange={(e) => setTrx(e.target.value)} style={{ marginBottom: '6px' }} />
        {fail && <p className="err">{fail}</p>}
        <button
          onClick={confirm}
          disabled={busy}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '15px', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '10px' }}
        >
          {busy ? t.payVerifying : t.payConfirmCrypto}
        </button>
      </div>
    </div>
  );
}

export default function CryptoPage() {
  return (
    <Suspense fallback={null}>
      <CryptoInner />
    </Suspense>
  );
}
