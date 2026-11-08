'use client';
import { useEffect } from 'react';

// Captures ?ref=<phone> from shared links into localStorage so orders can
// credit the referrer.
export default function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref');
      if (ref) {
        const digits = ref.replace(/\D/g, '').slice(-10);
        if (digits.length === 10) localStorage.setItem('tbcx_ref', digits);
      }
    } catch {}
  }, []);
  return null;
}
