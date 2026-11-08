'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '../../components/LangContext';
import Icon from '../../components/icons';
import { readCart, removeFromCart, clearCart } from '../../lib/cart';
import { fmtBdt } from '../../lib/format';
import ProductCard from '../../components/ProductCard';

export default function CartPage() {
  const { lang, t } = useLang();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState(null); // {code, percent, discount}
  const [couponMsg, setCouponMsg] = useState('');
  const [featured, setFeatured] = useState([]);

  const load = () => {
    const ids = readCart();
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        const list = (d.products || []).filter((p) => ids.includes(p.id));
        setItems(list);
        setFeatured((d.products || []).filter((p) => p.featured).slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const subtotal = items.reduce((a, p) => a + p.price, 0);

  useEffect(() => {
    if (couponState && subtotal > 0) {
      const discount = Math.round((subtotal * couponState.percent) / 100);
      setCouponState({ ...couponState, discount });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const applyCoupon = async () => {
    setCouponMsg('');
    const res = await fetch('/api/coupon', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon, subtotal }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    if (d && d.ok) {
      setCouponState({ code: d.code, percent: d.percent, discount: d.discount });
      setCouponMsg(t.couponOk);
      try { localStorage.setItem('tbcx_coupon', d.code); } catch {}
    } else {
      setCouponState(null);
      setCouponMsg(t.couponBad);
    }
  };

  return (
    <div className="wrap" style={{ padding: '30px 0 40px', maxWidth: '760px' }}>
      <h1 className="section-title">{t.cartTitle}</h1>
      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '20px' }}>{t.processing}</p>
      ) : items.length === 0 ? (
        <div className="glass" style={{ padding: '34px', textAlign: 'center', marginTop: '22px' }}>
          <span style={{ color: 'var(--muted)', display: 'inline-flex' }}><Icon name="cart" size={40} /></span>
          <div style={{ fontWeight: 800, fontSize: '17px', marginTop: '12px' }}>{t.cartEmpty}</div>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '6px' }}>{t.cartEmptySub}</p>
          <Link href="/#services" className="btn-lime" style={{ marginTop: '18px' }}>{t.heroCta}</Link>
        </div>
      ) : null}
      {!loading && items.length === 0 && featured.length > 0 ? (
        <>
          <h2 className="section-title" style={{ fontSize: '21px', marginTop: '34px' }}>{t.featuredTitle}</h2>
          <div className="svc-grid" style={{ marginTop: '18px' }}>
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: 'right', marginTop: '14px' }}>
            <button onClick={() => { clearCart(); load(); }} style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t.remove} × {items.length}</button>
          </div>
          <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
            {items.map((p) => (
              <div key={p.id} className="glass" style={{ display: 'flex', gap: '14px', padding: '13px', borderRadius: '16px', alignItems: 'center' }}>
                <img src={p.image} alt={p.title} style={{ width: '74px', height: '74px', objectFit: 'cover', borderRadius: '12px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '14.5px', lineHeight: 1.4 }}>{p.title}</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className="price" style={{ fontSize: '17px' }}>{fmtBdt(p.price, lang)}</span>
                    {p.oldPrice > p.price && <span className="old-price">{fmtBdt(p.oldPrice, lang)}</span>}
                  </div>
                </div>
                <button onClick={() => { removeFromCart(p.id); load(); }} aria-label={t.remove} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', width: '36px', height: '36px', borderRadius: '11px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="glass" style={{ padding: '18px', marginTop: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', gap: '9px' }}>
              <input className="inp" placeholder={t.couponPh} value={coupon} onChange={(e) => setCoupon(e.target.value)} style={{ flex: 1 }} />
              <button className="btn-ghost" onClick={applyCoupon} style={{ padding: '11px 18px' }}>{t.couponApply}</button>
            </div>
            {couponMsg && <p style={{ color: couponState ? '#a6f36a' : '#fca5a5', fontSize: '13px', fontWeight: 700, marginTop: '9px' }}>{couponMsg}</p>}
            <div style={{ borderTop: '1px solid var(--line)', marginTop: '15px', paddingTop: '14px', display: 'grid', gap: '8px', fontSize: '14.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}><span>{t.subtotal}</span><span>{fmtBdt(subtotal, lang)}</span></div>
              {couponState && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a6f36a', fontWeight: 700 }}><span>{t.discount} ({couponState.code})</span><span>−{fmtBdt(couponState.discount, lang)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '17px' }}><span>{t.total}</span><span style={{ color: 'var(--accent)' }}>{fmtBdt(subtotal - (couponState ? couponState.discount : 0), lang)}</span></div>
            </div>
            <button className="btn-lime" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={() => router.push('/checkout')}>
              <Icon name="bolt" size={17} />{t.checkout}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
