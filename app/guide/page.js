'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '../../components/LangContext';
import Icon from '../../components/icons';

export default function GuidePage() {
  const { t } = useLang();
  const [cfg, setCfg] = useState(null);
  useEffect(() => { fetch('/api/payments').then((r) => r.json()).then(setCfg).catch(() => {}); }, []);

  const section = { padding: '22px', borderRadius: '16px' };
  const h2 = { fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '9px' };
  const p = { color: 'var(--muted)', fontSize: '14.5px', lineHeight: 1.8, marginTop: '9px' };

  return (
    <div className="wrap" style={{ padding: '30px 0 50px', maxWidth: '720px' }}>
      <h1 className="section-title">{t.guideTitle}</h1>
      <div style={{ display: 'grid', gap: '14px', marginTop: '22px' }}>
        <div className="glass" style={section}>
          <div style={h2}><Icon name="cart" size={20} color="#a6f36a" />{t.step1T}</div>
          <p style={p}>{t.step1D} {t.step2D}</p>
        </div>
        <div className="glass" style={section}>
          <div style={h2}><Icon name="card" size={20} color="#a6f36a" />{t.payTitle}</div>
          <p style={p}>{t.a1}</p>
          {cfg && (
            <div style={{ display: 'grid', gap: '8px', marginTop: '13px' }}>
              {cfg.methods.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: '11px', padding: '10px 14px' }}>
                  <span style={{ fontWeight: 700 }}>{m.label}</span>
                  <span style={{ fontFamily: "'Manrope',monospace", fontWeight: 700 }}>{m.number} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>({m.dial})</span></span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: '11px', padding: '10px 14px' }}>
                <span style={{ fontWeight: 700 }}>USDT (TRC20)</span>
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{t.usdtRate}</span>
              </div>
            </div>
          )}
        </div>
        <div className="glass" style={section}>
          <div style={h2}><Icon name="package" size={20} color="#a6f36a" />{t.step3T}</div>
          <p style={p}>{t.a2}</p>
          <Link href="/track" className="btn-lime" style={{ marginTop: '13px', padding: '11px 20px', fontSize: '14px' }}>
            <Icon name="search" size={15} />{t.goTrack}
          </Link>
        </div>
        <div className="glass" style={section}>
          <div style={h2}><Icon name="message" size={20} color="#a6f36a" />{t.navSupport}</div>
          <p style={p}>{t.a3}</p>
        </div>
      </div>
    </div>
  );
}
