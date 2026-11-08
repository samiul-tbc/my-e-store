'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLang } from '../components/LangContext';
import Icon from '../components/icons';
import ProductCard from '../components/ProductCard';
import { readRecent } from '../lib/personal';
import { useStoreWa } from '../components/useStoreWa';

export default function HomePage() {
  const { t } = useLang();
  const storeWa = useStoreWa();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState([]);
  const [sort, setSort] = useState('default');
  const [searchFocus, setSearchFocus] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        const list = d.products || [];
        setProducts(list);
        const rids = readRecent();
        setRecent(list.filter((x) => rids.includes(x.id)).sort((a, b) => rids.indexOf(a.id) - rids.indexOf(b.id)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    try { setRecentSearches(JSON.parse(localStorage.getItem('tbcx_searches') || '[]')); } catch {}
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length >= 3 && !loading && products.length) {
      try {
        const prev = JSON.parse(localStorage.getItem('tbcx_searches') || '[]');
        const next = [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5);
        localStorage.setItem('tbcx_searches', JSON.stringify(next));
      } catch {}
    }
    if (q.length >= 3 && !loading && products.length && !products.some((p) => p.title.toLowerCase().includes(q.toLowerCase()))) {
      const key = 'tbcx_logged_' + q.toLowerCase();
      try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch {}
      fetch('/api/search-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q }) }).catch(() => {});
    }
  }, [query, loading, products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q ? products.filter((p) => p.title.toLowerCase().includes(q)) : [...products];
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    if (sort === 'popular') list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    return list;
  }, [products, query, sort]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 6);
  }, [products, query]);

  const featured = products.filter((p) => p.featured);

  return (
    <div className="wrap">
      {/* HERO */}
      <section style={{ padding: '52px 0 10px', textAlign: 'center' }}>
        <span className="chip"><Icon name="spark" size={13} />{t.heroChip}</span>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 54px)', fontWeight: 800, lineHeight: 1.18, margin: '20px auto 0', maxWidth: '760px', fontFamily: "'Manrope','Hind Siliguri',sans-serif", letterSpacing: '-0.5px' }}>
          {t.heroTitleA}<br />
          <span style={{ background: 'linear-gradient(90deg,#b8f77e,#7ee2a8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.heroTitleB}</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 'clamp(15px,2.4vw,17.5px)', lineHeight: 1.75, maxWidth: '620px', margin: '18px auto 0' }}>{t.heroSub}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '28px' }}>
          <a href="#services" className="btn-lime"><Icon name="bolt" size={17} />{t.heroCta}</a>
          <a href={"https://wa.me/" + storeWa} target="_blank" rel="noreferrer" className="btn-ghost"><Icon name="message" size={17} />{t.heroCta2}</a>
        </div>
        <div style={{ maxWidth: '520px', margin: '26px auto 0', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'inline-flex' }}><Icon name="search" size={18} /></span>
          <input
            className="inp"
            style={{ paddingLeft: '44px', borderRadius: '999px', background: 'rgba(15,23,36,0.55)', backdropFilter: 'blur(14px)' }}
            placeholder={t.searchPh}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setTimeout(() => setSearchFocus(false), 180)}
          />
          {searchFocus && suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 30, background: 'linear-gradient(180deg, rgba(20,28,44,0.92), rgba(10,14,22,0.9))', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '16px', backdropFilter: 'blur(20px)', overflow: 'hidden', textAlign: 'left', boxShadow: '0 20px 44px rgba(0,0,0,0.5)' }}>
              {suggestions.map((p) => (
                <a key={p.id} href={'/service/' + p.id} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 13px', textDecoration: 'none', color: 'inherit', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={p.image} alt="" style={{ width: '38px', height: '38px', borderRadius: '9px', objectFit: 'cover' }} />
                  <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700, lineHeight: 1.35 }}>{p.title}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '13.5px' }}>{'৳' + p.price}</span>
                </a>
              ))}
            </div>
          )}
        </div>
        {!query && recentSearches.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
            {recentSearches.map((q) => (
              <button key={q} onClick={() => setQuery(q)} style={{ padding: '7px 14px', borderRadius: '999px', border: '1px solid var(--line)', background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="clock" size={12} />{q}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '30px' }}>
          {[
            [String(products.length) + '+', t.statServices],
            [t.statPaymentVal, t.statPayment],
            [t.statDeliveryVal, t.statDelivery],
          ].map(([v, l]) => (
            <div key={l} className="glass" style={{ padding: '12px 20px', borderRadius: '14px', minWidth: '170px' }}>
              <div style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--accent)', fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{v}</div>
              <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="marquee" style={{ marginTop: '34px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '11px 0' }} aria-hidden="true">
        {[0, 1].map((dup) => (
          <div key={dup} className="marquee-track">
            {[t.f1T, t.f2T, t.f3T, t.statPaymentVal, t.statDeliveryVal, t.trustLine].map((txt, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px', fontWeight: 700 }}>
                <Icon name="shield" size={13} color="#a6f36a" />{txt}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* SERVICES */}
      <section id="services" style={{ padding: '52px 0 6px', scrollMarginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <h2 className="section-title">{query ? `${t.servicesTitle} — ${filtered.length}` : t.servicesTitle}</h2>
            <p className="section-sub">{t.servicesSub}</p>
          </div>
          <select className="inp" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto', padding: '9px 12px', fontSize: '13px', borderRadius: '11px' }} aria-label="sort">
            <option value="default">{t.sortDefault}</option>
            <option value="low">{t.sortLow}</option>
            <option value="high">{t.sortHigh}</option>
            <option value="popular">{t.sortPopular}</option>
          </select>
        </div>
        {loading ? (
          <div className="svc-grid" style={{ marginTop: '24px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="svc-card" style={{ cursor: 'default' }}>
                <div className="skel" style={{ height: '210px', borderRadius: 0 }} />
                <div className="svc-body">
                  <div className="skel" style={{ height: '16px', width: '75%', marginBottom: '10px' }} />
                  <div className="skel" style={{ height: '13px', width: '95%', marginBottom: '16px' }} />
                  <div className="skel" style={{ height: '20px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--muted)', marginTop: '22px' }}>{t.noResults}</p>
        ) : (
          <div className="svc-grid" style={{ marginTop: '24px' }}>
            {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      {/* RECENTLY VIEWED */}
      {!query && recent.length > 0 && (
        <section style={{ padding: '48px 0 0' }}>
          <h2 className="section-title" style={{ fontSize: '22px' }}>{t.recentTitle}</h2>
          <div style={{ display: 'flex', gap: '13px', overflowX: 'auto', padding: '18px 2px 6px', scrollbarWidth: 'none' }}>
            {recent.map((p) => (
              <a key={p.id} href={'/service/' + p.id} style={{ minWidth: '210px', maxWidth: '210px', textDecoration: 'none', color: 'inherit' }} className="svc-card">
                <div className="svc-media" style={{ height: '112px' }}>
                  <img src={p.image} alt={p.title} loading="lazy" />
                </div>
                <div style={{ padding: '11px 13px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  <div className="price" style={{ fontSize: '16px', marginTop: '4px' }}>৳{p.price}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section id="how" className="reveal" style={{ padding: '56px 0 6px', scrollMarginTop: '80px' }}>
        <h2 className="section-title">{t.howTitle}</h2>
        <div className="steps" style={{ marginTop: '24px' }}>
          {[
            ['1', 'cart', t.step1T, t.step1D],
            ['2', 'card', t.step2T, t.step2D],
            ['3', 'download', t.step3T, t.step3D],
          ].map(([n, icon, title, desc]) => (
            <div key={n} className="glass" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="step-num">{n}</span>
                <span style={{ color: 'var(--accent)' }}><Icon name={icon} size={22} /></span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '16.5px', marginTop: '16px' }}>{title}</div>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginTop: '7px' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section style={{ padding: '56px 0 6px' }} className="reveal">
        <h2 className="section-title">{t.whyTitle}</h2>
        <div className="steps" style={{ marginTop: '24px' }}>
          {[
            ['shield', t.f1T, t.f1D],
            ['bolt', t.f2T, t.f2D],
            ['lock', t.f3T, t.f3D],
          ].map(([icon, title, desc]) => (
            <div key={title} className="glass" style={{ padding: '22px' }}>
              <span style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(166,243,106,0.1)', border: '1px solid rgba(166,243,106,0.3)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                <Icon name={icon} size={21} />
              </span>
              <div style={{ fontWeight: 800, fontSize: '16.5px', marginTop: '15px' }}>{title}</div>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginTop: '7px' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="reveal" style={{ padding: '56px 0 6px', scrollMarginTop: '80px' }}>
        <h2 className="section-title">{t.faqTitle}</h2>
        <div style={{ display: 'grid', gap: '12px', marginTop: '24px' }}>
          {[[t.q1, t.a1], [t.q2, t.a2], [t.q3, t.a3]].map(([q, a], i) => (
            <div key={q} className="faq-item">
              <details open={i === 0}>
                <summary style={{ fontWeight: 800, fontSize: '15.5px' }}>{q}</summary>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginTop: '8px' }}>{a}</p>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass" style={{ marginTop: '56px', padding: '34px 26px', textAlign: 'center', borderColor: 'rgba(166,243,106,0.3)' }}>
        <h2 style={{ fontSize: 'clamp(21px,3.6vw,28px)', fontWeight: 800, fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{t.ctaTitle}</h2>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '9px', lineHeight: 1.7 }}>{t.ctaSub}</p>
        <a href={"https://wa.me/" + storeWa} target="_blank" rel="noreferrer" className="btn-lime" style={{ marginTop: '20px' }}>
          <Icon name="message" size={17} />{t.ctaBtn}
        </a>
      </section>
    </div>
  );
}
