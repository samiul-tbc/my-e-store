'use client';
import { useEffect, useState } from 'react';
import Icon from './icons';
import { readWishlist, toggleWish } from '../lib/personal';

export default function WishHeart({ id, size = 17 }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(readWishlist().includes(id));
    sync();
    window.addEventListener('tbcx-wish-changed', sync);
    return () => window.removeEventListener('tbcx-wish-changed', sync);
  }, [id]);
  return (
    <button
      aria-label="wishlist"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOn(toggleWish(id).includes(id)); }}
      style={{
        position: 'absolute', top: '10px', right: '10px', zIndex: 3,
        width: '34px', height: '34px', borderRadius: '999px',
        background: 'rgba(7,10,14,0.55)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center',
        cursor: 'pointer', color: on ? '#f87171' : '#e2e8f0',
      }}
    >
      <span style={{ display: 'inline-flex', fill: on ? '#f87171' : 'none' }}>
        <Icon name="heart" size={size} color={on ? '#f87171' : '#e2e8f0'} />
      </span>
    </button>
  );
}
