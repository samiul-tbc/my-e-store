// TBC x E-store logo — lime tile, dark bag mark with a lime bolt (store + energy).
export function LogoMark({ size = 38, radius = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="tbcx-lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c9ff8f" />
          <stop offset="55%" stopColor="#a6f36a" />
          <stop offset="100%" stopColor="#8fe34f" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx={radius * (60 / 38)} fill="url(#tbcx-lg)" />
      <path d="M26 27v-2.6a6 6 0 0 1 12 0V27" fill="none" stroke="#10170c" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M19.5 27h25l-2.3 19.2a4.5 4.5 0 0 1-4.5 4H26.3a4.5 4.5 0 0 1-4.5-4Z" fill="#10170c" />
      <polygon points="33.6,31.5 28.2,39.6 31.7,39.6 30,46.4 37.2,37.2 33.6,37.2" fill="#a6f36a" />
    </svg>
  );
}

export default function Logo({ size = 38, showCaption = true, light = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '11px' }}>
      <LogoMark size={size} />
      <span style={{ lineHeight: 1.08 }}>
        <span style={{ display: 'block', fontWeight: 800, fontSize: '16.5px', fontFamily: "'Manrope','Hind Siliguri',sans-serif", letterSpacing: '0.2px', color: light ? '#f1f5f9' : 'inherit' }}>
          TBC <span style={{ color: '#a6f36a' }}>×</span> E-STORE
        </span>
        {showCaption && (
          <span style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', letterSpacing: '1.6px', fontWeight: 700, marginTop: '2px' }}>
            PREMIUM E-SERVICES
          </span>
        )}
      </span>
    </span>
  );
}
