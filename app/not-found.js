'use client';
import Link from 'next/link';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '70px 0', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}><Logo size={46} /></div>
      <div style={{ fontSize: '64px', fontWeight: 800, fontFamily: "'Manrope',sans-serif", color: 'var(--accent)', marginTop: '22px', lineHeight: 1 }}>404</div>
      <p style={{ color: 'var(--muted)', fontSize: '16px', marginTop: '12px', lineHeight: 1.7 }}>
        পেজটি পাওয়া যায়নি — The page you are looking for does not exist.
      </p>
      <Link href="/" className="btn-lime" style={{ marginTop: '22px' }}>হোমে ফিরুন</Link>
    </div>
  );
}
