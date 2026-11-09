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
          <div style={h2}><Icon name="shield" size={20} color="#a6f36a" />{t.payGuideT}</div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>{t.payManualT}</div>
            <div style={{ display: 'grid', gap: '9px', marginTop: '10px' }}>
              {[t.pm1, t.pm2, t.pm3, t.pm4].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(166,243,106,0.15)', border: '1px solid rgba(166,243,106,0.45)', color: '#a6f36a', fontSize: '12px', fontWeight: 800, display: 'grid', placeItems: 'center', marginTop: '1px' }}>{i + 1}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '14.5px', lineHeight: 1.65 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '18px' }}>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>{t.payCryptoT}</div>
            <div style={{ display: 'grid', gap: '9px', marginTop: '10px' }}>
              {[t.pc1, t.pc2, t.pc3].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(38,161,123,0.15)', border: '1px solid rgba(38,161,123,0.5)', color: '#34d399', fontSize: '12px', fontWeight: 800, display: 'grid', placeItems: 'center', marginTop: '1px' }}>{i + 1}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '14.5px', lineHeight: 1.65 }}>{step}</span>
                </div>
              ))}
            </div>
            <p style={{ color: '#fbbf24', fontSize: '13.5px', lineHeight: 1.7, marginTop: '12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '10px 13px' }}>{t.pcWarn}</p>
          </div>
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
