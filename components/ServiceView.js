'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from './LangContext';
import Icon from './icons';
import ProductCard, { Stars } from './ProductCard';
import { addToCart } from '../lib/cart';
import { pushRecent } from '../lib/personal';
import { fmtBdt } from '../lib/format';
import { useStoreWa } from './useStoreWa';

export default function ServicePage({ params }) {
  const { lang, t } = useLang();
  const router = useRouter();
  const storeWa = useStoreWa();
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
  const [revSort, setRevSort] = useState('new');
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

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
    pushRecent(id);
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
      <div className="wrap" style={{ padding: '60px 0' }}>
        <div className="glass" style={{ padding: '38px 26px', textAlign: 'center', borderRadius: '18px' }}>
          <span style={{ color: 'var(--muted)', display: 'inline-flex' }}><Icon name="search" size={42} /></span>
          <div style={{ fontWeight: 800, fontSize: '18px', marginTop: '14px' }}>{t.notFound}</div>
          <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginTop: '8px', lineHeight: 1.7 }}>{t.notFoundSub}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <Link href="/#services" className="btn-lime">{t.heroCta}</Link>
            <Link href="/" className="btn-ghost"><Icon name="arrowLeft" size={16} />{t.backHome}</Link>
          </div>
        </div>
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
      <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--muted)', fontWeight: 600, fontSize: '13px', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>{t.navHome}</Link>
        <span>/</span>
        <Link href="/#services" style={{ color: 'var(--muted)', textDecoration: 'none' }}>{t.navServices}</Link>
        <span>/</span>
        <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{p.title}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '26px', marginTop: '18px', alignItems: 'start' }}>
        <div>
          <div className="svc-card" style={{ cursor: 'zoom-in' }} onClick={() => setLightbox(true)}>
            <div className="svc-media" style={{ height: 'auto', aspectRatio: '4/3.2' }}>
              {off > 0 && <span className="off-badge">-{off}%</span>}
              <img src={(p.images && p.images[imgIdx]) || p.image} alt={p.title} width={1000} height={800} decoding="async" />
            </div>
          </div>
          {p.images && p.images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              {p.images.map((src, i) => (
                <button key={i} aria-label={p.title + ' — ' + (i + 1)} onClick={() => setImgIdx(i)} style={{ padding: 0, border: i === imgIdx ? '2px solid #a6f36a' : '2px solid transparent', borderRadius: '11px', overflow: 'hidden', cursor: 'pointer', background: 'none' }}>
                  <img src={src} alt="" width={58} height={58} loading="lazy" decoding="async" style={{ width: '58px', height: '58px', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
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
              <span className="price" style={{ fontSize: '30px' }}>{fmtBdt(p.price, lang)}</span>
              {p.oldPrice > p.price && <span className="old-price" style={{ fontSize: '15px' }}>{fmtBdt(p.oldPrice, lang)}</span>}
              {off > 0 && <span style={{ marginLeft: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '12px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px' }}>-{off}%</span>}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '5px' }}>≈ ${(p.price / 120).toFixed(2)} USD</div>
          </div>

          <p style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--muted)', fontSize: '13px', marginTop: '13px' }}>
            <Icon name="clock" size={14} color="#a6f36a" />{t.deliveryTimeNote}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '16px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 700, display: 'inline-flex', gap: '6px', alignItems: 'center' }}><Icon name="send" size={14} />{t.share}</span>
            {typeof window !== 'undefined' && ['whatsapp', 'telegram', 'facebook'].map((net) => {
              const url = encodeURIComponent(window.location.href);
              const text = encodeURIComponent(p.title + ' — TBC × E-store');
              const href = net === 'whatsapp' ? `https://wa.me/?text=${text}%20${url}` : net === 'telegram' ? `https://t.me/share/url?url=${url}&text=${text}` : `https://www.facebook.com/sharer/sharer.php?u=${url}`;
              return (
                <a key={net} href={href} target="_blank" rel="noreferrer" style={{ padding: '7px 13px', borderRadius: '999px', border: '1px solid var(--line)', background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none', textTransform: 'capitalize' }}>{net}</a>
              );
            })}
          </div>

          {p.demoUrl && (
            <a href={p.demoUrl} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '10px 17px', fontSize: '13.5px', marginTop: '14px', marginRight: '10px' }}>
              <Icon name="eye" size={15} />{t.demoBtn}
            </a>
          )}
          <a href={'https://wa.me/' + storeWa + '?text=' + encodeURIComponent(t.askQuestion + ': ' + p.title)} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#4be07f', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none', marginTop: '13px' }}>
            <Icon name="message" size={15} />{t.askQuestion}
          </a>

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

      {/* DELIVERY PROCESS */}
      <section className="glass" style={{ marginTop: '34px', padding: '20px', borderRadius: '18px' }} aria-label={t.dpTitle}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 16px' }}>{t.dpTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px' }}>
          {[
            { icon: 'cart', title: t.dp1, desc: t.dp1D },
            { icon: 'card', title: t.dp2, desc: t.dp2D },
            { icon: 'shield', title: t.dp3, desc: t.dp3D },
            { icon: 'download', title: t.dp4, desc: t.dp4D },
          ].map((st, i) => (
            <div key={st.title} style={{ display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
              <span style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(166,243,106,0.12)', border: '1px solid rgba(166,243,106,0.35)', display: 'grid', placeItems: 'center', color: '#a6f36a', flexShrink: 0 }}>
                <Icon name={st.icon} size={18} />
              </span>
              <span>
                <span style={{ display: 'block', fontWeight: 800, fontSize: '14px' }}>{i + 1}. {st.title}</span>
                <span style={{ display: 'block', color: 'var(--muted)', fontSize: '12.5px', lineHeight: 1.55, marginTop: '2px' }}>{st.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ marginTop: '46px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h2 className="section-title" style={{ fontSize: '24px' }}>{t.reviews} {reviews.length > 0 && `(${reviews.length})`}</h2>
          {reviews.length > 1 && (
            <select className="inp" value={revSort} onChange={(e) => setRevSort(e.target.value)} style={{ width: 'auto', padding: '8px 11px', fontSize: '12.5px', borderRadius: '10px' }} aria-label="review sort">
              <option value="new">Newest</option>
              <option value="high">Highest</option>
              <option value="low">Lowest</option>
            </select>
          )}
        </div>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--muted)', marginTop: '12px', fontSize: '14.5px' }}>{t.noReviews}</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
            {[...reviews].sort((a, b) => revSort === 'high' ? (b.rating || 0) - (a.rating || 0) : revSort === 'low' ? (a.rating || 0) - (b.rating || 0) : (b.ts || 0) - (a.ts || 0)).map((r, i) => (
              <div key={i} className="glass" style={{ padding: '16px 18px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '14.5px' }}>{r.name}</span>
                  <span className="stars">{[1, 2, 3, 4, 5].map((s) => <span key={s} className={s <= (r.rating || 5) ? '' : 'off'}>★</span>)}</span>
                  {r.verified && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(166,243,106,0.12)', border: '1px solid rgba(166,243,106,0.4)', color: '#a6f36a', fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}><Icon name="shield" size={11} />{t.verifiedBuyer}</span>}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.7, marginTop: '7px' }}>{r.text}</p>
                {r.reply && (
                  <div style={{ marginTop: '10px', background: 'rgba(166,243,106,0.06)', border: '1px solid rgba(166,243,106,0.25)', borderRadius: '10px', padding: '9px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#a6f36a', letterSpacing: '0.4px' }}>TBC × E-store</span>
                    <p style={{ color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.65, marginTop: '3px' }}>{r.reply}</p>
                  </div>
                )}
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

      {p.faqs && p.faqs.length > 0 && (
        <section style={{ marginTop: '42px' }}>
          <h2 className="section-title" style={{ fontSize: '24px' }}>{t.faqTitle}</h2>
          <div style={{ display: 'grid', gap: '11px', marginTop: '18px' }}>
            {p.faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <details>
                  <summary style={{ fontWeight: 800, fontSize: '15px' }}>{(f.q && (f.q[lang] || f.q.bn)) || ''}</summary>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginTop: '8px' }}>{(f.a && (f.a[lang] || f.a.bn)) || ''}</p>
                </details>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <section style={{ marginTop: '46px' }}>
          <h2 className="section-title" style={{ fontSize: '24px' }}>{t.servicesTitle}</h2>
          <div className="svc-grid" style={{ marginTop: '20px' }}>
            {related.map((x) => <ProductCard key={x.id} p={x} />)}
          </div>
        </section>
      )}

      {lightbox && (
        <div role="button" aria-label={t.closeLabel} onClick={() => setLightbox(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(2,4,7,0.92)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: '18px', cursor: 'zoom-out' }}>
          <img src={(p.images && p.images[imgIdx]) || p.image} alt={p.title} decoding="async" style={{ maxWidth: '100%', maxHeight: '88vh', borderRadius: '16px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} />
          <span style={{ position: 'absolute', top: '18px', right: '18px', color: '#e2e8f0', display: 'inline-flex' }}><Icon name="x" size={26} /></span>
        </div>
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
