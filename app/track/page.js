'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLang } from '../../components/LangContext';
import Icon from '../../components/icons';

const STATUS_STYLE = {
  pending: { bg: 'rgba(251,191,36,0.13)', bd: 'rgba(251,191,36,0.45)', fg: '#fcd34d' },
  processing: { bg: 'rgba(56,189,248,0.13)', bd: 'rgba(56,189,248,0.45)', fg: '#7dd3fc' },
  completed: { bg: 'rgba(166,243,106,0.13)', bd: 'rgba(166,243,106,0.45)', fg: '#a6f36a' },
  cancelled: { bg: 'rgba(239,68,68,0.13)', bd: 'rgba(239,68,68,0.45)', fg: '#fca5a5' },
};

function Timeline({ t, status }) {
  const step = status === 'completed' ? 3 : status === 'processing' ? 2 : status === 'cancelled' ? 0 : 1;
  const names = [t.tlPlaced, t.tlPaid, t.tlDone];
  return (
    <div className="tl">
      {names.map((n, i) => (
        <div key={n} className={'tl-step' + (step > i ? ' done' : '')}>
          <span className="tl-dot">{step > i ? <Icon name="check" size={15} strokeWidth={3} /> : <span style={{ fontSize: '12px', fontWeight: 800 }}>{i + 1}</span>}</span>
          <div className="tl-name">{n}</div>
        </div>
      ))}
    </div>
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
  const { t } = useLang();
  const sp = useSearchParams();
  const [query, setQuery] = useState(sp.get('q') || '');
  const [orders, setOrders] = useState(null);
  const [busy, setBusy] = useState(false);
  const [searchedByPhone, setSearchedByPhone] = useState(false);

  const search = async (q) => {
    const v = (q != null ? q : query).trim();
    if (!v) return;
    setBusy(true);
    setSearchedByPhone(!/^ES-/i.test(v));
    const res = await fetch('/api/track?q=' + encodeURIComponent(v)).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    setOrders(d ? d.orders || [] : []);
    setBusy(false);
  };

  useEffect(() => {
    if (sp.get('q')) search(sp.get('q'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel = (s) => ({ pending: t.stPending, processing: t.stProcessing, completed: t.stCompleted, cancelled: t.stCancelled }[s] || s);

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
        <div className="glass" style={{ padding: '22px', textAlign: 'center', marginTop: '20px', color: 'var(--muted)', fontSize: '14.5px' }}>{t.trackNotFound}</div>
      )}

      <div style={{ display: 'grid', gap: '14px', marginTop: '20px' }}>
        {(orders || []).map((o) => {
          const st = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
          return (
            <div key={o.code} className="glass" style={{ padding: '18px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: "'Manrope',monospace", fontWeight: 800, fontSize: '16px', color: '#a6f36a' }}>{o.code}</div>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', marginTop: '3px' }}>{o.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '2px' }}>
                    ৳{o.price}{o.paymentMethod ? ' • ' + o.paymentMethod : ''} • {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <span className="status-pill" style={{ background: st.bg, border: '1px solid ' + st.bd, color: st.fg }}>{statusLabel(o.status)}</span>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Timeline t={t} status={o.status} />
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
              {o.status !== 'completed' && (
                <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Icon name="lock" size={13} />{t.bdayLocked}
                </p>
              )}
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
