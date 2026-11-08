'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="wrap" style={{ padding: '70px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '52px', fontWeight: 800, fontFamily: "'Manrope',sans-serif", color: '#fca5a5', lineHeight: 1 }}>Oops!</div>
      <p style={{ color: 'var(--muted)', fontSize: '16px', marginTop: '12px', lineHeight: 1.7 }}>
        কিছু সমস্যা হয়েছে — Something went wrong. আবার চেষ্টা করুন।
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '22px', flexWrap: 'wrap' }}>
        <button className="btn-lime" onClick={() => reset()}>আবার চেষ্টা করুন</button>
        <Link href="/" className="btn-ghost">হোমে ফিরুন</Link>
      </div>
    </div>
  );
}
