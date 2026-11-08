'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLang } from '../../../components/LangContext';
import Icon from '../../../components/icons';
import Logo from '../../../components/Logo';

function InvoiceInner({ code }) {
  const { t } = useLang();
  const sp = useSearchParams();
  const [phone, setPhone] = useState(sp.get('phone') || '');
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async (ph) => {
    setBusy(true);
    setErr('');
    const res = await fetch('/api/invoice?code=' + encodeURIComponent(code) + '&phone=' + encodeURIComponent(ph || '')).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    setBusy(false);
    if (d && d.ok) setOrder(d.order);
    else setErr(d && d.error === 'phone' ? t.dlWrong : t.trackNotFound);
  };

  useEffect(() => {
    let ph = sp.get('phone') || '';
    if (!ph) {
      try { const u = JSON.parse(localStorage.getItem('tbcx_user') || 'null'); if (u && u.phone) ph = u.phone; } catch {}
    }
    if (ph) { setPhone(ph); load(ph); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="wrap" style={{ padding: '34px 0 60px', maxWidth: '640px' }}>
      {!order ? (
        <div className="glass" style={{ padding: '22px', borderRadius: '16px' }}>
          <div style={{ fontWeight: 800, fontSize: '16.5px', display: 'flex', gap: '9px', alignItems: 'center' }}><Icon name="doc" size={19} color="#a6f36a" />{t.invoice} — {code}</div>
          <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginTop: '8px', lineHeight: 1.7 }}>{t.dlNote}</p>
          <div style={{ display: 'flex', gap: '9px', marginTop: '14px' }}>
            <input className="inp" placeholder={t.fPhonePh} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" style={{ flex: 1 }} />
            <button className="btn-lime" style={{ padding: '11px 18px', fontSize: '14px' }} onClick={() => load(phone)} disabled={busy}>{t.dlVerify}</button>
          </div>
          {err && <p className="err">{err}</p>}
        </div>
      ) : (
        <div style={{ background: '#fff', color: '#111827', borderRadius: '16px', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.45)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
            <Logo size={40} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '19px', letterSpacing: '1px' }}>INVOICE</div>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '3px' }}>{order.code}</div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</div>
            </div>
          </div>
          <div style={{ borderTop: '2px solid #a6f36a', marginTop: '18px', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13.5px' }}>
            <div>
              <div style={{ color: '#6b7280', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.6px' }}>BILLED TO</div>
              <div style={{ fontWeight: 700, marginTop: '5px' }}>{order.customerName}</div>
              <div style={{ color: '#374151' }}>{order.phone}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.6px' }}>PAYMENT</div>
              <div style={{ marginTop: '5px' }}>{order.paymentMethod || '—'}</div>
              {order.trxId && <div style={{ color: '#374151' }}>TrxID: {order.trxId}</div>}
              <div style={{ marginTop: '3px', fontWeight: 700, textTransform: 'capitalize' }}>{order.status}</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', borderRadius: '8px 0 0 8px' }}>Service</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', borderRadius: '0 8px 8px 0' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{order.title}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 700 }}>৳{order.price}</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', fontWeight: 800 }}>Total</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#65a30d', fontSize: '16px' }}>৳{order.price}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '18px', lineHeight: 1.6 }}>
            TBC × E-store — Premium E-Services • WhatsApp: 01319-760720 • This is a computer-generated invoice.
          </p>
          <button className="btn-lime no-print" style={{ marginTop: '14px', padding: '11px 20px', fontSize: '14px' }} onClick={() => window.print()}>
            <Icon name="doc" size={16} />{t.printInvoice}
          </button>
          <style>{'@media print { .no-print, header, footer, body > div > div > a { display: none !important; } body { background: #fff; } }'}</style>
        </div>
      )}
    </div>
  );
}

export default function InvoicePage({ params }) {
  return (
    <Suspense fallback={null}>
      <InvoiceInner code={params.code} />
    </Suspense>
  );
}
