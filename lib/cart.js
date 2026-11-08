'use client';
// Tiny cart store on localStorage, shared via a window event.
const KEY = 'tbcx_cart';

export function readCart() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function writeCart(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('tbcx-cart-changed'));
  } catch {}
}

export function addToCart(productId) {
  const items = readCart();
  if (!items.includes(productId)) items.push(productId);
  writeCart(items);
  return items;
}

export function removeFromCart(productId) {
  writeCart(readCart().filter((id) => id !== productId));
}

export function clearCart() { writeCart([]); }

export function cartCount() { return readCart().length; }
