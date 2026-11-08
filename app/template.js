'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Subtle page fade/slide on every route change.
export default function Template({ children }) {
  const pathname = usePathname();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.classList.remove('page-in');
      void ref.current.offsetWidth;
      ref.current.classList.add('page-in');
    }
  }, [pathname]);
  return (
    <div ref={ref} className="page-in" key={pathname}>
      {children}
    </div>
  );
}
