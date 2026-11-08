'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '../../components/LangContext';
import Icon from '../../components/icons';
import { fmtBdt, bnDigits } from '../../lib/format';
import { readWishlist } from '../../lib/personal';

export default function ProfilePage() {
  const { lang, t } = useLang();
  const [user, setUser] = useState({ name: '', phone: '', telegram: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState('');
  const [wishN, setWishN] = useState(0);
  const [refCopied, setRefCopied] = useState(false);
  const refLink = user.phone && typeof window !== 'undefined' ? window.location.origin + '/?ref=' + user.phone.replace(/\D/g, '').slice(-10) : '';

  useEffect(() => {
    let u = null;
    try { u = JSON.parse(localStorage.getItem('tbcx_user') || 'null'); } catch {}
    if (u) setUser({ name: u.name || '', phone: u.phone || '', telegram: u.telegram || '' });
    setWishN(readWishlist().length);
    if (u && u.phone) {
      fetch('/api/track?q=' + encodeURIComponent(u.phone))
        .then((r) => r.json())
        .then((d) => { setOrders(d.orders || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const save = () => {
    try { localStorage.setItem('tbcx_user', JSON.stringify(user)); } catch {}
    setSaved(t.profileSaved);
    setTimeout(() => setSaved(''), 1800);
    if (user.phone) {
      setLoading(true);
      fetch('/api/track?q=' + encodeURIComponent(user.phone))
        .then((r) => r.json())
        .then((d) => { setOrders(d.orders || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  };

  const completed = orders.filter((o) => o.status === 'completed');
  const spent = completed.reduce((a, o) => a + (Number(o.price) || 0), 0);
  const num = (n) => (lang === 'bn' ? bnDigits(n) : String(n));

  return (
    <div className="wrap" style={{ padding: '30px 0 46px', maxWidth: '680px' }}>
      <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon name="users" size={25} color="#a6f36a" />{t.profileTitle}
      </h1>

      <div className="steps" style={{ marginTop: '20px' }}>
        {[
          [num(orders.length), t.totalOrders, 'package'],
          [num(completed.length), t.completedOrders, 'check'],
          [fmtBdt(spent, lang), t.totalSpent, 'card'],
        ].map(([v, l, icon]) => (
          <div key={l} className="glass" style={{ padding: '17px', textAlign: 'center' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex' }}><Icon name={icon} size={19} /></span>
            <div style={{ fontWeight: 800, fontSize: '20px', marginTop: '7px', fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{v}</div>
            <div style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '2px' }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '16px', display: 'grid', gap: '13px' }}>
        <div>
          <label className="lbl">{t.fName}</label>
          <input className="inp" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} placeholder={t.fNamePh} />
        </div>
        <div>
          <label className="lbl">{t.fPhone}</label>
          <input className="inp" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} placeholder={t.fPhonePh} inputMode="tel" />
        </div>
        <div>
          <label className="lbl">{t.fTelegram}</label>
          <input className="inp" value={user.telegram} onChange={(e) => setUser({ ...user, telegram: e.target.value })} placeholder={t.fTelegramPh} />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-lime" style={{ padding: '11px 20px', fontSize: '14px' }} onClick={save}><Icon name="check" size={15} />{t.saveProfile}</button>
          {saved && <span style={{ color: '#a6f36a', fontSize: '13px', fontWeight: 700 }}>{saved}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
        <Link href="/track" className="btn-ghost" style={{ flex: 1, justifyContent: 'center', minWidth: '150px' }}><Icon name="package" size={16} />{t.trackTitle}</Link>
        <Link href="/wishlist" className="btn-ghost" style={{ flex: 1, justifyContent: 'center', minWidth: '150px' }}><Icon name="heart" size={16} />{t.wishTitle}{wishN > 0 ? ` (${num(wishN)})` : ''}</Link>
        <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', minWidth: '150px' }} onClick={() => {
          const payload = JSON.stringify({ profile: user, orders, exportedAt: new Date().toISOString() }, null, 2);
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
          a.download = 'my-tbcx-data.json';
          a.click();
          URL.revokeObjectURL(a.href);
        }}><Icon name="download" size={16} />JSON</button>
      </div>

      {refLink && (
        <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '16px', borderColor: 'rgba(166,243,106,0.3)' }}>
          <div style={{ fontWeight: 800, fontSize: '15.5px', display: 'flex', gap: '8px', alignItems: 'center' }}><Icon name="users" size={17} color="#a6f36a" />{t.refTitle}</div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px', lineHeight: 1.65 }}>{t.refSub}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input className="inp" readOnly value={refLink} style={{ flex: 1, fontSize: '13px' }} onFocus={(e) => e.target.select()} />
            <button className="btn-lime" style={{ padding: '10px 16px', fontSize: '13.5px' }} onClick={async () => { try { await navigator.clipboard.writeText(refLink); setRefCopied(true); setTimeout(() => setRefCopied(false), 1600); } catch {} }}>
              <Icon name={refCopied ? 'check' : 'copy'} size={14} />{refCopied ? t.payCopied : t.copyLink}
            </button>
          </div>
        </div>
      )}

      <h2 className="section-title" style={{ fontSize: '20px', marginTop: '30px' }}>{t.myOrders}</h2>
      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '14px' }}>{t.processing}</p>
      ) : orders.length === 0 ? (
        <p style={{ color: 'var(--muted)', marginTop: '14px', fontSize: '14.5px' }}>{t.trackNotFound}</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
          {orders.slice(0, 8).map((o) => (
            <Link key={o.code} href={'/track?q=' + o.code} className="glass" style={{ padding: '13px 16px', borderRadius: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
              <span>
                <span style={{ fontFamily: "'Manrope',monospace", fontWeight: 800, color: '#a6f36a', fontSize: '13.5px' }}>{o.code}</span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '14px', marginTop: '3px' }}>{o.title}</span>
              </span>
              <span style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{fmtBdt(o.price, lang)}</span>
                <span style={{ display: 'block', color: 'var(--muted)', fontSize: '12px', marginTop: '2px', textTransform: 'capitalize' }}>{o.status}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
