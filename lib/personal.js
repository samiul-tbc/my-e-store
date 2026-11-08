'use client';
// Wishlist + recently-viewed, both on localStorage.
const WKEY = 'tbcx_wishlist';
const RKEY = 'tbcx_recent';

function read(key) {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function write(key, arr, event) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent(event));
  } catch {}
}

export const readWishlist = () => read(WKEY);
export function toggleWish(id) {
  const list = read(WKEY);
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  write(WKEY, next, 'tbcx-wish-changed');
  return next;
}

export const readRecent = () => read(RKEY);
export function pushRecent(id) {
  const list = [id, ...read(RKEY).filter((x) => x !== id)].slice(0, 8);
  write(RKEY, list, 'tbcx-recent-changed');
}
