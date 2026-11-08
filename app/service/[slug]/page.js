'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '../../../components/LangContext';
import Icon from '../../../components/icons';
import ProductCard, { Stars } from '../../../components/ProductCard';
import { addToCart } from '../../../lib/cart';

export default function ServicePage({ params }) {
  const { lang, t } = useLang();
  const router = useRouter();
  const id = params.slug;
  const [p, setP] = useState(null);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [added, setAdded] = useState(false);
  const [rName, setRName] = useState('');
  const [rText, setRText] = useState('');
  const [rRating, setRRating] = useState(5);
  const [rMsg, setRMsg] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        const list = d.products || [];
        setAll(list);
        setP(list.find((x) => x.id === id) || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch('/api/reviews?product=' + encodeURIComponent(id))
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {});
    try {
      const u = JSON.parse(localStorage.getItem('tbcx_user') || 'null');
      if (u && u.name) setRName(u.name);
    } catch {}
  }, [id]);

  if (loading) return <div className="wrap" style={{ padding: '60px 0', color: 'var(--muted)' }}>{t.processing}</div>;
  if (!p) {
    return (
      <div className="wrap" style={{ padding: '70px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>{t.notFound}</p>
        <Link href="/" className="btn-ghost" style={{ marginTop: '18px' }}><Icon name="arrowLeft" size={16} />{t.backHome}</Link>
      </div>
    );
  }

  const off = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const related = all.filter((x) => x.id !== p.id).slice(0, 4);
  const bullets = (p.bullets && (p.bullets[lang] || p.bullets.bn)) || [];

  const submitReview = async () => {
    setRMsg('');
    let phone = '';
    try { const u = JSON.parse(localStorage.getItem('tbcx_user') || 'null'); if (u && u.phone) phone = u.phone; } catch {}
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: p.id, name: rName, rating: rRating, text: rText, phone }),
    }).catch(() => null);
    if (res && res.ok) {
      setReviews((prev) => [{ name: rName, rating: rRating, text: rText, ts: Date.now(), verified: false }, ...prev]);
      setRText('');
      setRMsg(t.reviewThanks);
    } else setRMsg(t.errorGeneric);
  };

  return (
    <div className="wrap" style={{ padding: '26px 0 120px' }}>
      <Link href="/#services" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--muted)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
        <Icon name="arrowLeft" size={16} />{t.backHome}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '26px', marginTop: '18px', alignItems: 'start' }}>
        <div className="svc-card" style={{ cursor: 'default' }}>
          <div className="svc-media" style={{ height: 'auto', aspectRatio: '4/3.2' }}>
            {off > 0 && <span className="off-badge">-{off}%</span>}
            <img src={p.image} alt={p.title} />
          </div>
        </div>

        <div>
          <span className="chip"><Icon name="globe" size={13} />{t.brandSub}</span>
          <h1 style={{ fontSize: 'clamp(24px,4.4vw,34px)', fontWeight: 800, lineHeight: 1.3, marginTop: '14px', fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{p.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15.5px', lineHeight: 1.75, marginTop: '10px' }}>{(p.tagline && (p.tagline[lang] || p.tagline.bn)) || ''}</p>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
            {p.reviewCount > 0 && <Stars rating={p.rating} count={p.reviewCount} />}
            {p.sold > 0 && <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600, display: 'inline-flex', gap: '5px', alignItems: 'center' }}><Icon name="check" size={14} color="#a6f36a" />{p.sold} {t.soldCount}</span>}
          </div>

          <div className="glass" style={{ padding: '18px', marginTop: '18px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.5px' }}>{t.priceLabel}</div>
            <div style={{ marginTop: '5px' }}>
              <span className="price" style={{ fontSize: '30px' }}>৳{p.price}</span>
              {p.oldPrice > p.price && <span className="old-price" style={{ fontSize: '15px' }}>৳{p.oldPrice}</span>}
              {off > 0 && <span style={{ marginLeft: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '12px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px' }}>-{off}%</span>}
            </div>
          </div>

          <h3 style={{ fontSize: '17px', fontWeight: 800, marginTop: '24px' }}>{t.whatsIncluded}</h3>
          <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', marginTop: '13px' }}>
            {bullets.map((b) => (
              <li key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#cbd5e1', fontSize: '14.5px', lineHeight: 1.65 }}>
                <span style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }}><Icon name="check" size={16} strokeWidth={3} /></span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* REVIEWS */}
      <section style={{ marginTop: '46px' }}>
        <h2 className="section-title" style={{ fontSize: '24px' }}>{t.reviews} {reviews.length > 0 && `(${reviews.length})`}</h2>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--muted)', marginTop: '12px', fontSize: '14.5px' }}>{t.noReviews}</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
            {reviews.map((r, i) => (
              <div key={i} className="glass" style={{ padding: '16px 18px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '14.5px' }}>{r.name}</span>
                  <span className="stars">{[1, 2, 3, 4, 5].map((s) => <span key={s} className={s <= (r.rating || 5) ? '' : 'off'}>★</span>)}</span>
                  {r.verified && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(166,243,106,0.12)', border: '1px solid rgba(166,243,106,0.4)', color: '#a6f36a', fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}><Icon name="shield" size={11} />{t.verifiedBuyer}</span>}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.7, marginTop: '7px' }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="glass" style={{ padding: '18px', marginTop: '18px', borderRadius: '16px' }}>
          <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '12px' }}>{t.writeReview}</div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRRating(s)} aria-label={s + ' star'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: s <= rRating ? '#fbbf24' : '#334155', padding: '2px' }}>★</button>
            ))}
          </div>
          <input className="inp" placeholder={t.reviewNamePh} value={rName} onChange={(e) => setRName(e.target.value)} style={{ marginBottom: '10px' }} />
          <textarea className="inp" placeholder={t.reviewTextPh} value={rText} onChange={(e) => setRText(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          {rMsg && <p style={{ color: '#a6f36a', fontSize: '13px', fontWeight: 700, marginTop: '10px' }}>{rMsg}</p>}
          <button className="btn-lime" style={{ marginTop: '13px', padding: '11px 20px', fontSize: '14px' }} onClick={submitReview} disabled={!rName.trim() || !rText.trim()}>
            <Icon name="send" size={15} />{t.reviewSubmit}
          </button>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section style={{ marginTop: '46px' }}>
          <h2 className="section-title" style={{ fontSize: '24px' }}>{t.servicesTitle}</h2>
          <div className="svc-grid" style={{ marginTop: '20px' }}>
            {related.map((x) => <ProductCard key={x.id} p={x} />)}
          </div>
        </section>
      )}

      {/* ACTION BAR */}
      <div className="action-bar">
        <button
          className="btn-ghost"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { addToCart(p.id); setAdded(true); setTimeout(() => setAdded(false), 1800); }}
        >
          <Icon name={added ? 'check' : 'cart'} size={17} />{added ? t.addedToCart : t.addToCart}
        </button>
        <button
          className="btn-lime"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { addToCart(p.id); router.push('/checkout?buy=' + encodeURIComponent(p.id)); }}
        >
          <Icon name="bolt" size={17} />{t.buyNow}
        </button>
      </div>
    </div>
  );
}
