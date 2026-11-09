'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Shared context for the payment funnel: order ids from the URL, the payment
// config from /api/payments, and the last-order summary saved at checkout.
export function usePayCtx() {
  const sp = useSearchParams();
  const ids = (sp.get('orders') || '').split(',').filter(Boolean);
  const [cfg, setCfg] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('/api/payments').then((r) => r.json()).then(setCfg).catch(() => {});
    try {
      const s = JSON.parse(localStorage.getItem('tbcx_last_order') || 'null');
      if (s) setSummary(s);
    } catch {}
  }, []);

  const total = summary && summary.ids && ids.every((i) => summary.ids.includes(i)) ? summary.total : null;
  const usdtAmount = total != null && cfg ? (total / cfg.usdtRate).toFixed(2) : null;
  const ordersQs = 'orders=' + ids.join(',');

  return { ids, cfg, summary, total, usdtAmount, ordersQs };
}

export const METHOD_LOGOS = {
  bkash: '/logos/bkash.png',
  nagad: '/logos/nagad.png',
  rocket: '/logos/rocket.png',
  upay: '/logos/upay.png',
};
export const USDT_LOGO = '/logos/usdt.png';
export const BYBIT_LOGO = '/logos/bybit.jpg';
