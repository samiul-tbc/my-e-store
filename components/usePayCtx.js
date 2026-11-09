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
  bkash: 'https://1000logos.net/wp-content/uploads/2021/02/Bkash-logo.png',
  nagad: 'https://i.postimg.cc/3xv1gSBL/Nagad-Logo-wine.png',
  rocket: 'https://i.postimg.cc/vBM08r5J/vecteezy-rocket-color-logo-mobile-banking-icon-68706013.png',
  upay: 'https://i.postimg.cc/Gh9qphTM/upay-logo-mobile-banking-app-icon-transparent-background-free-png.png',
};
export const USDT_LOGO = 'https://cryptologos.cc/logos/tether-usdt-logo.png';
export const BYBIT_LOGO = 'https://i.postimg.cc/vTPhzDcs/bybit5549.jpg';
