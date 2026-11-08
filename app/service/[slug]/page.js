'use client';
import Link from 'next/link';
import { getService } from '../../../lib/services';
import { useLang } from '../../../components/LangContext';
import Icon from '../../../components/icons';

export default function ServicePage({ params }) {
  const { lang, t } = useLang();
  const s = getService(params.slug);
  if (!s) {
    return (
      <div className="wrap" style={{ padding: '70px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>{t.notFound}</p>
        <Link href="/" className="btn-ghost" style={{ marginTop: '18px' }}><Icon name="arrowLeft" size={16} />{t.backHome}</Link>
      </div>
    );
  }
  const off = s.oldPrice > s.price ? Math.round((1 - s.price / s.oldPrice) * 100) : 0;
  return (
    <div className="wrap" style={{ padding: '30px 0 10px' }}>
      <Link href="/#services" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--muted)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
        <Icon name="arrowLeft" size={16} />{t.backHome}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '26px', marginTop: '20px', alignItems: 'start' }}>
        <div className="svc-card" style={{ cursor: 'default' }}>
          <div className="svc-media" style={{ height: 'auto', aspectRatio: '4/3.4' }}>
            {off > 0 && <span className="off-badge">-{off}%</span>}
            <img src={s.image} alt={s.title} />
          </div>
        </div>

        <div>
          <span className="chip"><Icon name="globe" size={13} />{t.brandSub}</span>
          <h1 style={{ fontSize: 'clamp(24px,4.4vw,34px)', fontWeight: 800, lineHeight: 1.3, marginTop: '14px', fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>{s.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15.5px', lineHeight: 1.75, marginTop: '10px' }}>{s.tagline[lang] || s.tagline.bn}</p>

          <div className="glass" style={{ padding: '18px', marginTop: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.5px' }}>{t.priceLabel}</div>
            <div style={{ marginTop: '5px' }}>
              <span className="price" style={{ fontSize: '30px' }}>৳{s.price}</span>
              {s.oldPrice > s.price && <span className="old-price" style={{ fontSize: '15px' }}>৳{s.oldPrice}</span>}
              {off > 0 && <span style={{ marginLeft: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '12px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px' }}>-{off}%</span>}
            </div>
            <a href={s.hubcartUrl} target="_blank" rel="noreferrer" className="btn-lime" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
              <Icon name="cart" size={17} />{t.orderNow}
            </a>
            <p style={{ color: 'var(--muted)', fontSize: '12.5px', lineHeight: 1.65, marginTop: '12px', textAlign: 'center' }}>{t.orderNote}</p>
          </div>

          <h3 style={{ fontSize: '17px', fontWeight: 800, marginTop: '26px' }}>{t.whatsIncluded}</h3>
          <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', marginTop: '13px' }}>
            {(s.bullets[lang] || s.bullets.bn).map((b) => (
              <li key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#cbd5e1', fontSize: '14.5px', lineHeight: 1.65 }}>
                <span style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }}><Icon name="check" size={16} strokeWidth={3} /></span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
