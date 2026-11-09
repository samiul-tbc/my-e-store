'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from './LangContext';
import { readCart } from '../lib/cart';
import Icon from './icons';

// Liquid-glass bottom nav with the fluid-lens pill (same approved system as
// Hub Cart): on a tab switch the pill stretches 180ms to cover old+new, then
// spring-settles onto the target.
const HIDE_ON = ['/service/', '/checkout', '/payment', '/tbcadsonia', '/order-success'];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();
  const wrapRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const [trans, setTrans] = useState('transform 0.45s cubic-bezier(0.34, 1.45, 0.44, 1), width 0.45s cubic-bezier(0.34, 1.45, 0.44, 1), opacity 0.2s ease');
  const pillRef = useRef({ left: 0, width: 0, ready: false });
  const timerRef = useRef(null);
  const [cartN, setCartN] = useState(0);
  const [navHidden, setNavHidden] = useState(false);

  const hidden = pathname && HIDE_ON.some((pre) => pathname === pre || pathname.startsWith(pre));

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setNavHidden(y > 340 && y > lastY + 4);
      if (y < lastY - 4 || y < 340) setNavHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sync = () => setCartN(readCart().length);
    sync();
    window.addEventListener('tbcx-cart-changed', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('tbcx-cart-changed', sync); window.removeEventListener('storage', sync); };
  }, [pathname]);

  const navItems = [
    { key: 'home', name: t.navHome, href: '/', icon: 'home' },
    { key: 'track', name: t.navTrack, href: '/track', icon: 'doc' },
    { key: 'cart', name: t.navCart, href: '/cart', icon: 'cart', badge: cartN },
    { key: 'profile', name: t.profileTitle.replace('আমার ', '').replace('My ', ''), href: '/profile', icon: 'users' },
  ];
  const activeItem = navItems.find((i) => i.href === pathname);

  const measure = () => {
    const el = activeItem ? itemRefs.current[activeItem.key] : null;
    const wrap = wrapRef.current;
    if (el && wrap) {
      const wr = wrap.getBoundingClientRect();
      const br = el.getBoundingClientRect();
      const target = { left: br.left - wr.left, width: br.width, ready: true };
      const prev = pillRef.current;
      const SPRING = 'transform 0.45s cubic-bezier(0.34, 1.45, 0.44, 1), width 0.45s cubic-bezier(0.34, 1.45, 0.44, 1), opacity 0.2s ease';
      if (prev.ready && Math.abs(target.left - prev.left) > 24) {
        const l = Math.min(prev.left, target.left);
        const r = Math.max(prev.left + prev.width, target.left + target.width);
        setTrans('transform 0.18s ease-out, width 0.18s ease-out, opacity 0.2s ease');
        const stretched = { left: l, width: r - l, ready: true };
        pillRef.current = stretched;
        setPill(stretched);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setTrans(SPRING);
          pillRef.current = target;
          setPill(target);
        }, 185);
      } else {
        setTrans(SPRING);
        pillRef.current = target;
        setPill(target);
      }
    }
  };

  useLayoutEffect(measure, [pathname, hidden, t]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [pathname, hidden]);

  useEffect(() => {
    if (hidden) {
      pillRef.current = { left: 0, width: 0, ready: false };
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [hidden]);

  if (hidden) return null;

  const itemStyle = (isActive) => ({
    position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    textDecoration: 'none', gap: '4px', color: isActive ? '#10170c' : '#94a3b8',
    padding: '6px 14px', borderRadius: '999px', minWidth: '62px', fontSize: '11px',
    fontWeight: isActive ? '700' : '400', transition: 'color 0.25s ease',
  });

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed', bottom: '12px', left: '12px', right: '12px', zIndex: 50,
        background: 'linear-gradient(180deg, rgba(20, 28, 44, 0.66), rgba(10, 14, 22, 0.6))',
        border: '1px solid rgba(255, 255, 255, 0.13)', borderRadius: '999px',
        backdropFilter: 'blur(22px) saturate(180%)', WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -1px 0 rgba(255, 255, 255, 0.05), 0 18px 42px rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '7px 8px', maxWidth: '520px', margin: '0 auto',
        transform: navHidden ? 'translateY(130%)' : 'translateY(0)',
        transition: 'transform 0.35s cubic-bezier(0.22, 0.9, 0.3, 1)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', top: '7px', left: 0, height: 'calc(100% - 14px)', width: pill.width,
          transform: `translateX(${pill.left}px)`, opacity: pill.ready && activeItem ? 1 : 0,
          background: 'linear-gradient(180deg, #c9ff8f 0%, #a6f36a 55%, #8fe34f 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -2px 4px rgba(0,0,0,0.12), 0 4px 14px rgba(166, 243, 106, 0.4)',
          borderRadius: '999px', transition: trans, willChange: 'transform',
        }}
      />
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.key} ref={(el) => { itemRefs.current[item.key] = el; }} href={item.href} style={itemStyle(isActive)}>
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon name={item.icon} size={22} color={isActive ? '#10170c' : '#94a3b8'} />
              {item.badge > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-10px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, minWidth: '17px', height: '17px', borderRadius: '999px', display: 'grid', placeItems: 'center', padding: '0 4px', border: '2px solid #0b0f16' }}>{item.badge}</span>
              )}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
