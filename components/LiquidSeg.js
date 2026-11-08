'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Liquid segmented control: a glossy pill slides (spring-like) behind the active option.
// options: [{ value, label }]. Controlled: value + onChange(value).
export default function LiquidSeg({ options, value, onChange, height = 34, fontSize = 12 }) {
  const wrapRef = useRef(null);
  const btnRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  const measure = () => {
    const btn = btnRefs.current[value];
    const wrap = wrapRef.current;
    if (btn && wrap) {
      const wr = wrap.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      setPill({ left: br.left - wr.left, width: br.width, ready: true });
    }
  };

  useLayoutEffect(measure, [value, options]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [value]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(15, 23, 36, 0.55)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 18px rgba(0,0,0,0.35)',
        borderRadius: '999px',
        padding: '3px',
        gap: '2px',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '3px',
          left: 0,
          height: `calc(100% - 6px)`,
          width: pill.width,
          transform: `translateX(${pill.left}px)`,
          opacity: pill.ready ? 1 : 0,
          background: 'linear-gradient(180deg, #c9ff8f 0%, #a6f36a 55%, #8fe34f 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -2px 4px rgba(0,0,0,0.12), 0 4px 12px rgba(166, 243, 106, 0.45)',
          borderRadius: '999px',
          transition: 'transform 0.45s cubic-bezier(0.34, 1.45, 0.44, 1), width 0.45s cubic-bezier(0.34, 1.45, 0.44, 1), opacity 0.2s ease',
          willChange: 'transform',
        }}
      />
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => { btnRefs.current[opt.value] = el; }}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              position: 'relative',
              zIndex: 1,
              background: 'transparent',
              border: 'none',
              borderRadius: '999px',
              height: height - 6,
              padding: '0 14px',
              fontSize,
              fontWeight: 800,
              cursor: 'pointer',
              color: active ? '#10170c' : '#94a3b8',
              transition: 'color 0.25s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
