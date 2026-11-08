'use client';
import { useEffect, useState } from 'react';

// Store WhatsApp number (admin-editable via /api/store), cached module-wide.
let cache = null;
let pending = null;

export function useStoreWa() {
  const [num, setNum] = useState(cache || '8801319760720');
  useEffect(() => {
    if (cache) { setNum(cache); return; }
    if (!pending) {
      pending = fetch('/api/store')
        .then((r) => r.json())
        .then((d) => { if (d && d.whatsapp) cache = d.whatsapp; return cache; })
        .catch(() => null);
    }
    pending.then((v) => { if (v) setNum(v); });
  }, []);
  return num;
}
