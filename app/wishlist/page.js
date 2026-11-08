'use client';
import { useEffect, useState } from 'react';
import { useLang } from '../../components/LangContext';
import Icon from '../../components/icons';
import ProductCard from '../../components/ProductCard';
import { readWishlist } from '../../lib/personal';

export default function WishlistPage() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const ids = readWishlist();
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => { setItems((d.products || []).filter((p) => ids.includes(p.id))); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => {
    load();
    window.addEventListener('tbcx-wish-changed', load);
    return () => window.removeEventListener('tbcx-wish-changed', load);
  }, []);

  return (
    <div className="wrap" style={{ padding: '30px 0 46px' }}>
      <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon name="heart" size={26} color="#f87171" />{t.wishTitle}
      </h1>
      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '20px' }}>{t.processing}</p>
      ) : items.length === 0 ? (
        <div className="glass" style={{ padding: '32px', textAlign: 'center', marginTop: '22px', color: 'var(--muted)', fontSize: '14.5px' }}>{t.wishEmpty}</div>
      ) : (
        <div className="svc-grid" style={{ marginTop: '22px' }}>
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
