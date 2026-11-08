'use client';
import { useEffect, useState } from 'react';

// Thin lime scroll-progress bar at the very top.
export default function ScrollProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setW(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, height: '3px', width: w + '%', background: 'linear-gradient(90deg,#b8f77e,#7ee2a8)', zIndex: 200, transition: 'width 0.08s linear', boxShadow: '0 0 10px rgba(166,243,106,0.6)' }} />
  );
}
