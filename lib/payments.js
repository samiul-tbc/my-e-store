import { fetchSetting, parseJson } from './supabase';

// Payment accounts — same business accounts as Hub Cart (shown publicly on
// its payment pages). Admin can override via settings `estore_payments`.
export const PAYMENT_METHODS = [
  { id: 'bkash', label: 'bKash', number: '01894693890', dial: '*247#', color: '#e2136e' },
  { id: 'nagad', label: 'Nagad', number: '01894693890', dial: '*167#', color: '#ee4023' },
  { id: 'rocket', label: 'Rocket', number: '01893432478', dial: '*322#', color: '#8c3494' },
  { id: 'upay', label: 'Upay', number: '01894693890', dial: '*268#', color: '#00b14f' },
];
export const USDT_ADDRESS = 'TJy7RE5zHs7E6Mqjr44PMuJJNXmqE9nYc1';
export const USDT_RATE = 120; // BDT per 1 USDT

export async function getPaymentConfig() {
  const raw = await fetchSetting('estore_payments');
  const cfg = parseJson(raw, null);
  if (cfg && typeof cfg === 'object') {
    return {
      methods: Array.isArray(cfg.methods) && cfg.methods.length ? cfg.methods : PAYMENT_METHODS,
      usdtAddress: cfg.usdtAddress || USDT_ADDRESS,
      usdtRate: Number(cfg.usdtRate) || USDT_RATE,
    };
  }
  return { methods: PAYMENT_METHODS, usdtAddress: USDT_ADDRESS, usdtRate: USDT_RATE };
}
