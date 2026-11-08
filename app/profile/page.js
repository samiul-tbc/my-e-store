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
      </div>

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
