'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLang } from '../../components/LangContext';
import { fmtBdt, bnDigits } from '../../lib/format';
import { useStoreWa } from '../../components/useStoreWa';
import Icon from '../../components/icons';

const STATUS_STYLE = {
  pending: { bg: 'rgba(251,191,36,0.13)', bd: 'rgba(251,191,36,0.45)', fg: '#fcd34d' },
  processing: { bg: 'rgba(56,189,248,0.13)', bd: 'rgba(56,189,248,0.45)', fg: '#7dd3fc' },
  completed: { bg: 'rgba(166,243,106,0.13)', bd: 'rgba(166,243,106,0.45)', fg: '#a6f36a' },
  cancelled: { bg: 'rgba(239,68,68,0.13)', bd: 'rgba(239,68,68,0.45)', fg: '#fca5a5' },
};

function Timeline({ t, status, createdAt, history }) {
  const step = status === 'completed' ? 3 : status === 'processing' ? 2 : status === 'cancelled' ? 0 : 1;
  const names = [t.tlPlaced, t.tlPaid, t.tlDone];
  const at = (st) => {
    if (st === 'placed') return createdAt ? new Date(createdAt) : null;
    const h = (history || []).filter((x) => x.status === st).pop();
    return h ? new Date(h.ts) : null;
  };
  const dates = [at('placed'), at('processing'), at('completed')];
  return (
    <div className="tl">
      {names.map((n, i) => (
        <div key={n} className={'tl-step' + (step > i ? ' done' : '')}>
          <span className="tl-dot">{step > i ? <Icon name="check" size={15} strokeWidth={3} /> : <span style={{ fontSize: '12px', fontWeight: 800 }}>{i + 1}</span>}</span>
          <div className="tl-name">{n}</div>
          {dates[i] && step > i && <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' }}>{dates[i].toLocaleDateString()}</div>}
        </div>
      ))}
    </div>
  );
}

function CodeCopy({ t, code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <button
      onClick={copy}
      aria-label={t.payCopy}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: copied ? '#a6f36a' : 'var(--muted)', borderRadius: '999px', padding: '4px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={12} />{copied ? t.payCopied : t.payCopy}
    </button>
  );
}

function DownloadBox({ t, order, searchedByPhone, query }) {
  const [phone, setPhone] = useState('');
  const [info, setInfo] = useState(order.delivery);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(searchedByPhone);

  const verify = async (ph) => {
    setBusy(true);
    setMsg('');
    const res = await fetch('/api/download', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'info', orderId: order.code, phone: ph }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    setBusy(false);
    if (d && d.ok) { setInfo(d); setVerified(true); }
    else setMsg(t.dlWrong);
  };

  useEffect(() => {
    if (searchedByPhone && query) verify(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = async () => {
    setBusy(true);
    const res = await fetch('/api/download', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'download', orderId: order.code, phone: phone || query }),
    }).catch(() => null);
    if (res && res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Premium-Bio-Website-Source.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (info) setInfo({ ...info, remaining: Math.max(0, info.remaining - 1) });
    } else {
      const d = res ? await res.json().catch(() => null) : null;
      if (d && d.reason === 'limit' && info) setInfo({ ...info, remaining: 0 });
      else setMsg(t.errorGeneric);
    }
    setBusy(false);
  };

  return (
    <div style={{ marginTop: '14px', background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '14px', padding: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14.5px', color: '#7dd3fc' }}>
        <Icon name="download" size={17} />{t.dlTitle}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '6px', lineHeight: 1.6 }}>{t.dlNote}</p>
      {!verified ? (
        <div style={{ display: 'flex', gap: '8px', marginTop: '11px' }}>
          <input className="inp" placeholder={t.fPhonePh} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" style={{ flex: 1 }} />
          <button className="btn-ghost" onClick={() => verify(phone)} disabled={busy} style={{ padding: '10px 16px' }}>{t.dlVerify}</button>
        </div>
      ) : info && info.remaining > 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '11px', flexWrap: 'wrap' }}>
          <button className="btn-lime" style={{ padding: '11px 20px', fontSize: '14px', background: 'linear-gradient(135deg,#7dd3fc,#38bdf8)', boxShadow: '0 10px 26px rgba(56,189,248,0.25)' }} onClick={download} disabled={busy}>
            <Icon name="download" size={16} />{t.dlBtn}
          </button>
          <span style={{ color: '#7dd3fc', fontSize: '13px', fontWeight: 700 }}>{info.remaining}/{info.limit} {t.dlLeft}</span>
        </div>
      ) : (
        <p style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 700, marginTop: '10px' }}>{t.dlGone}</p>
      )}
      {msg && <p className="err">{msg}</p>}
    </div>
  );
}

function TrackInner() {
  const { lang, t } = useLang();
  const storeWa = useStoreWa();
  const sp = useSearchParams();
  const [query, setQuery] = useState(sp.get('q') || '');
  const [orders, setOrders] = useState(null);
  const [busy, setBusy] = useState(false);
  const [searchedByPhone, setSearchedByPhone] = useState(false);

  const search = async (q) => {
    const v = (q != null ? q : query).trim();
    if (!v) return;
    try { localStorage.setItem('tbcx_last_code', v); } catch {}
    setBusy(true);
    setSearchedByPhone(!/^ES-/i.test(v));
    const res = await fetch('/api/track?q=' + encodeURIComponent(v)).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    setOrders(d ? d.orders || [] : []);
    setBusy(false);
  };

  useEffect(() => {
    if (sp.get('q')) { search(sp.get('q')); return; }
    try {
      const last = localStorage.getItem('tbcx_last_code');
      if (last) { setQuery(last); search(last); }
    } catch {}
    try {
      const u = JSON.parse(localStorage.getItem('tbcx_user') || 'null');
      if (u && u.phone) { setQuery(u.phone); search(u.phone); }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel = (s) => ({ pending: t.stPending, processing: t.stProcessing, completed: t.stCompleted, cancelled: t.stCancelled }[s] || s);

  // Live status: quietly re-check every 30s while an order is in progress.
  useEffect(() => {
    if (!orders || !orders.some((o) => o.status === 'pending' || o.status === 'processing')) return undefined;
    const iv = setInterval(() => { if (!document.hidden) search(); }, 30000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  return (
    <div className="wrap" style={{ padding: '30px 0 46px', maxWidth: '680px' }}>
      <h1 className="section-title">{t.trackTitle}</h1>
      <p className="section-sub">{t.trackSub}</p>
      <div style={{ display: 'flex', gap: '9px', marginTop: '20px' }}>
        <input className="inp" placeholder={t.trackPh} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') search(); }} style={{ flex: 1 }} />
        <button className="btn-lime" onClick={() => search()} disabled={busy} style={{ padding: '12px 20px' }}>
          <Icon name="search" size={16} />{t.trackBtn}
        </button>
      </div>

      {orders !== null && orders.length === 0 && (
        <div className="glass" style={{ padding: '34px', textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: 'var(--muted)', display: 'inline-flex' }}><Icon name="search" size={40} /></span>
          <div style={{ color: 'var(--muted)', fontSize: '14.5px', marginTop: '12px', lineHeight: 1.7 }}>{t.trackNotFound}</div>
          <Link href="/#services" className="btn-lime" style={{ marginTop: '18px' }}>{t.heroCta}</Link>
        </div>
      )}

      <div style={{ display: 'grid', gap: '14px', marginTop: '20px' }}>
        {(orders || []).map((o) => {
          const st = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
          return (
            <div key={o.code} className="glass" style={{ padding: '18px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <span style={{ fontFamily: "'Manrope',monospace", fontWeight: 800, fontSize: '16px', color: '#a6f36a' }}>{o.code}</span>
                    <CodeCopy t={t} code={o.code} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', marginTop: '3px' }}>{o.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '2px' }}>
                    {fmtBdt(o.price, lang)}{o.paymentMethod ? ' • ' + o.paymentMethod : ''} • {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <span className="status-pill" style={{ background: st.bg, border: '1px solid ' + st.bd, color: st.fg }}>{statusLabel(o.status)}</span>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Timeline t={t} status={o.status} createdAt={o.createdAt} history={o.history} />
              </div>
              {o.status === 'completed' && o.delivery && o.delivery.kind === 'link' && (
                <div style={{ marginTop: '14px', background: 'rgba(166,243,106,0.07)', border: '1px solid rgba(166,243,106,0.35)', borderRadius: '14px', padding: '15px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#a6f36a', display: 'flex', gap: '8px', alignItems: 'center' }}><Icon name="gift" size={17} />{t.deliveryTitle}</div>
                  <a href={o.delivery.url} target="_blank" rel="noreferrer" className="btn-lime" style={{ marginTop: '11px', padding: '11px 20px', fontSize: '14px' }}>
                    <Icon name="external" size={15} />{t.bdayOpen}
                  </a>
                </div>
              )}
              {o.status === 'completed' && o.delivery && o.delivery.kind === 'download' && (
                <DownloadBox t={t} order={o} searchedByPhone={searchedByPhone} query={query} />
              )}
              {o.status === 'completed' && o.delivery && o.delivery.kind === 'text' && (
                <div style={{ marginTop: '14px', background: 'rgba(166,243,106,0.07)', border: '1px solid rgba(166,243,106,0.35)', borderRadius: '14px', padding: '15px', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 800, color: '#a6f36a', marginBottom: '7px' }}>{t.deliveryTitle}</div>
                  {o.delivery.text}
                </div>
              )}
              {o.status === 'completed' && (
                <a href={'/invoice/' + o.code} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '13px', fontWeight: 700, textDecoration: 'none', marginTop: '12px' }}>
                  <Icon name="doc" size={14} />{t.invoice}
                </a>
              )}
              {o.status !== 'completed' && (
                <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Icon name="lock" size={13} />{t.bdayLocked}
                </p>
              )}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
                {o.productId && (
                  <a href={'/checkout?buy=' + o.productId} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#a6f36a', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                    <Icon name="refresh" size={14} />{t.buyAgain}
                  </a>
                )}
                {o.status !== 'completed' && (
                  <a href={'https://wa.me/' + storeWa + '?text=' + encodeURIComponent('আমার অর্ডার ' + o.code + ' (' + o.title + ') নিয়ে সাহায্য দরকার')} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                    <Icon name="message" size={14} />{t.needHelp}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackInner />
    </Suspense>
  );
}
