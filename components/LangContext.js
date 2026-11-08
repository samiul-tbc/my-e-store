'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { STRINGS } from '../lib/strings';

const LangCtx = createContext({ lang: 'bn', t: STRINGS.bn, toggle: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState('bn');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('estore_lang');
      if (saved === 'en' || saved === 'bn') setLang(saved);
    } catch {}
  }, []);
  const toggle = () => {
    setLang((prev) => {
      const next = prev === 'bn' ? 'en' : 'bn';
      try { localStorage.setItem('estore_lang', next); } catch {}
      return next;
    });
  };
  return <LangCtx.Provider value={{ lang, t: STRINGS[lang] || STRINGS.bn, toggle }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
