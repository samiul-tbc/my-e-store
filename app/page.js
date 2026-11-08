'use client';
import Link from 'next/link';
import { SERVICES } from '../lib/services';
import { useLang } from '../components/LangContext';
import Icon from '../components/icons';

const offPct = (s) => (s.oldPrice > s.price ? Math.round((1 - s.price / s.oldPrice) * 100) : 0);

export default function HomePage() {
  const { lang, t } = useLang();
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
          <a href="https://wa.me/8801319760720" target="_blank" rel="noreferrer" className="btn-ghost"><Icon name="message" size={17} />{t.heroCta2}</a>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '34px' }}>
          {[
            [String(SERVICES.length) + '+', t.statServices],
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

      {/* SERVICES */}
      <section id="services" style={{ padding: '56px 0 6px', scrollMarginTop: '80px' }}>
        <h2 className="section-title">{t.servicesTitle}</h2>
        <p className="section-sub">{t.servicesSub}</p>
        <div className="svc-grid" style={{ marginTop: '24px' }}>
          {SERVICES.map((s) => (
            <Link key={s.slug} href={`/service/${s.slug}`} className="svc-card">
              <div className="svc-media">
                {offPct(s) > 0 && <span className="off-badge">-{offPct(s)}%</span>}
                <img src={s.image} alt={s.title} loading="lazy" />
              </div>
              <div className="svc-body">
                <div className="svc-title">{s.title}</div>
                <p className="svc-tag">{s.tagline[lang] || s.tagline.bn}</p>
                <div className="svc-bottom">
                  <div>
                    <span className="price">৳{s.price}</span>
                    {s.oldPrice > s.price && <span className="old-price">৳{s.oldPrice}</span>}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 800, fontSize: '13.5px' }}>
                    {t.details}<Icon name="arrowRight" size={15} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '56px 0 6px', scrollMarginTop: '80px' }}>
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
      <section style={{ padding: '56px 0 6px' }}>
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
      <section id="faq" style={{ padding: '56px 0 6px', scrollMarginTop: '80px' }}>
        <h2 className="section-title">{t.faqTitle}</h2>
        <div style={{ display: 'grid', gap: '12px', marginTop: '24px' }}>
          {[[t.q1, t.a1], [t.q2, t.a2], [t.q3, t.a3]].map(([q, a]) => (
            <div key={q} className="faq-item">
              <div style={{ fontWeight: 800, fontSize: '15.5px' }}>{q}</div>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginTop: '6px' }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass" style={{ marginTop: '56px', padding: '34px 26px', textAlign: 'center', borderColor: 'rgba(166,243,106,0.3)' }}>
        <h2 style={{ fontSize: 'clamp(21px,3.6vw,28px)', fontWeight: 800, fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{t.ctaTitle}</h2>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '9px', lineHeight: 1.7 }}>{t.ctaSub}</p>
        <a href="https://wa.me/8801319760720" target="_blank" rel="noreferrer" className="btn-lime" style={{ marginTop: '20px' }}>
          <Icon name="message" size={17} />{t.ctaBtn}
        </a>
      </section>
    </div>
  );
}
