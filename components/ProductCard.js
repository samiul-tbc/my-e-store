'use client';
import Link from 'next/link';
import { useLang } from './LangContext';
import Icon from './icons';
import WishHeart from './WishHeart';

export function Stars({ rating, count }) {
  const full = Math.round(rating || 0);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span className="stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= full ? '' : 'off'}>★</span>
        ))}
      </span>
      {count > 0 && <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{rating} ({count})</span>}
    </span>
  );
}

export default function ProductCard({ p }) {
  const { lang, t } = useLang();
  const off = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const isNew = p.addedAt && (Date.now() - new Date(p.addedAt).getTime()) < 14 * 86400000;
  const badge = p.sold >= 3 ? 'HOT' : isNew ? 'NEW' : null;
  return (
    <Link href={`/service/${p.id}`} className="svc-card">
      <div className="svc-media">
        {off > 0 && <span className="off-badge">-{off}%</span>}
        <WishHeart id={p.id} />
        {badge && <span style={{ position: 'absolute', top: '10px', left: off > 0 ? '64px' : '10px', background: badge === 'HOT' ? 'rgba(239,68,68,0.9)' : 'rgba(56,189,248,0.9)', color: '#fff', fontSize: '10.5px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', letterSpacing: '0.6px' }}>{badge}</span>}
        <img src={p.image} alt={p.title} loading="lazy" />
      </div>
      <div className="svc-body">
        <div className="svc-title">{p.title}</div>
        <p className="svc-tag">{(p.tagline && (p.tagline[lang] || p.tagline.bn)) || ''}</p>
        {(p.reviewCount > 0 || p.sold > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {p.reviewCount > 0 && <Stars rating={p.rating} count={p.reviewCount} />}
            {p.sold > 0 && <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600, display: 'inline-flex', gap: '5px', alignItems: 'center' }}><Icon name="check" size={13} color="#a6f36a" />{p.sold} {t.soldCount}</span>}
          </div>
        )}
        <div className="svc-bottom">
          <div>
            <span className="price">৳{p.price}</span>
            {p.oldPrice > p.price && <span className="old-price">৳{p.oldPrice}</span>}
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 800, fontSize: '13.5px' }}>
            {t.details}<Icon name="arrowRight" size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
