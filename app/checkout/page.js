'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useLang } from '../../components/LangContext';
import Icon from '../../components/icons';
import LiquidSeg from '../../components/LiquidSeg';
import { readCart, clearCart } from '../../lib/cart';
import { fmtBdt } from '../../lib/format';
import { RELATIONS, THEMES, REL_THEME } from '../../lib/birthday-shared';

const REL_KEYS = { premika: 'relPremika', apu: 'relApu', junior: 'relJunior', friend: 'relFriend', vai: 'relVai' };
const THEME_KEYS = { midnight: 'themeMidnight', candy: 'themeCandy', ocean: 'themeOcean' };

function BdayForm({ t, value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const pickRel = (rel) => {
    const next = { ...value, rel };
    if (!value.themeTouched) next.theme = REL_THEME[rel] || 'midnight';
    onChange(next);
  };
  return (
    <div style={{ display: 'grid', gap: '13px' }}>
      <div>
        <label className="lbl">{t.bdayName} *</label>
        <input className="inp" value={value.name || ''} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div>
        <label className="lbl">{t.bdayBirth} *</label>
        <input className="inp" type="date" value={value.birth || ''} onChange={(e) => set('birth', e.target.value)} />
      </div>
      <div>
        <label className="lbl">{t.bdayRel}</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {RELATIONS.map((r) => (
            <button key={r} type="button" className={'rel-chip' + (value.rel === r ? ' on' : '')} onClick={() => pickRel(r)}>{t[REL_KEYS[r]]}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="lbl">{t.bdayTheme}</label>
        <LiquidSeg
          options={THEMES.map((th) => ({ value: th, label: t[THEME_KEYS[th]] }))}
          value={value.theme || 'midnight'}
          onChange={(v) => onChange({ ...value, theme: v, themeTouched: true })}
          height={36}
          fontSize={13}
        />
      </div>
      <div>
        <label className="lbl">{t.bdayPhoto}</label>
        <input className="inp" value={value.photo || ''} onChange={(e) => set('photo', e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className="lbl">{t.bdayMsg}</label>
        <textarea className="inp" rows={2} value={value.msg || ''} onChange={(e) => set('msg', e.target.value)} style={{ resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {[['midnight', 'linear-gradient(135deg,#1e1b4b,#7c3aed)'], ['candy', 'linear-gradient(135deg,#ec4899,#f59e0b)'], ['ocean', 'linear-gradient(135deg,#0ea5e9,#22d3ee)']].map(([th, grad]) => (
          <button key={th} type="button" onClick={() => onChange({ ...value, theme: th, themeTouched: true })} style={{ height: '38px', borderRadius: '11px', background: grad, border: value.theme === th ? '2px solid #a6f36a' : '2px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff', fontSize: '11.5px', fontWeight: 800, textShadow: '0 1px 4px rgba(0,0,0,0.5)', fontFamily: 'inherit' }}>
            {t[THEME_KEYS[th]]}
          </button>
        ))}
      </div>
      <div>
        <label className="lbl">{t.bdayFrom}</label>
        <input className="inp" value={value.from || ''} onChange={(e) => set('from', e.target.value)} />
      </div>
    </div>
  );
}

function CheckoutInner() {
  const { lang, t } = useLang();
  const router = useRouter();
  const sp = useSearchParams();
  const buyId = sp.get('buy');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [bday, setBday] = useState({});
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [fail, setFail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [vip, setVip] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [bumpId, setBumpId] = useState(null);

  useEffect(() => {
    const ids = buyId ? [buyId] : readCart();
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        const list = (d.products || []).filter((p) => ids.includes(p.id));
        setItems(list);
        setAllProducts(d.products || []);
        const init = {};
        for (const p of list) if (p.infoForm) {
          let draft = null;
          try { draft = JSON.parse(localStorage.getItem('tbcx_bday_' + p.id) || 'null'); } catch {}
          init[p.id] = draft && typeof draft === 'object' ? { rel: 'friend', theme: 'ocean', ...draft } : { name: '', birth: '', rel: 'friend', theme: 'ocean', photo: '', msg: '', from: '' };
        }
        setBday(init);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    try {
      const u = JSON.parse(localStorage.getItem('tbcx_user') || 'null');
      if (u) { if (u.name) setName(u.name); if (u.phone) setPhone(u.phone); if (u.telegram) setTelegram(u.telegram); }
      const c = localStorage.getItem('tbcx_coupon');
      if (c) setCouponCode(c);
    } catch {}
  }, [buyId]);

  const bumpProduct = useMemo(() => {
    if (items.length === 0) return null;
    return allProducts.find((p) => !items.some((i) => i.id === p.id) && !p.infoForm) || null;
  }, [allProducts, items]);
  const subtotal = useMemo(() => items.reduce((a, p) => a + p.price, 0) + (bumpId && bumpProduct ? bumpProduct.price : 0), [items, bumpId, bumpProduct]);

  useEffect(() => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 11 || subtotal <= 0) { setVip(null); return undefined; }
    const tm = setTimeout(() => {
      fetch('/api/vip-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, subtotal }) })
        .then((r) => r.json())
        .then((d) => { if (d && d.ok) setVip(d); })
        .catch(() => {});
    }, 600);
    return () => clearTimeout(tm);
  }, [phone, subtotal]);

  const place = async () => {
    const errs = {};
    if (!name.trim()) errs.name = t.required;
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 11) errs.phone = t.phoneBad;
    for (const p of items) {
      if (p.infoForm) {
        const b = bday[p.id] || {};
        if (!b.name || !b.name.trim()) errs['bday_' + p.id] = t.required;
        if (!b.birth) errs['bday_' + p.id] = t.required;
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPlacing(true);
    setFail('');
    try { localStorage.setItem('tbcx_user', JSON.stringify({ name, phone, telegram })); } catch {}
    const res = await fetch('/api/order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [...items.map((p) => p.id), ...(bumpId && bumpProduct ? [bumpProduct.id] : [])], name, phone, telegram, coupon: couponCode || undefined, bday, ref: (() => { try { return localStorage.getItem('tbcx_ref') || undefined; } catch { return undefined; } })() }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    if (d && d.ok) {
      try {
        localStorage.setItem('tbcx_last_order', JSON.stringify({ ids: d.orders.map((o) => o.code), total: d.total, discount: d.discount, titles: d.orders.map((o) => o.title) }));
        if (!buyId) clearCart();
        localStorage.removeItem('tbcx_coupon');
      } catch {}
      router.push('/payment?orders=' + d.orders.map((o) => o.code).join(','));
    } else {
      setFail(t.errorGeneric);
      setPlacing(false);
    }
  };

  if (loading) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>{t.processing}</div>;
  if (!items.length) return <div className="wrap" style={{ padding: '50px 0', color: 'var(--muted)' }}>{t.cartEmpty}</div>;

  return (
    <div className="wrap" style={{ padding: '28px 0 46px', maxWidth: '680px' }}>
      <h1 className="section-title">{t.coTitle}</h1>

      <div className="glass" style={{ padding: '18px', marginTop: '20px', borderRadius: '16px', display: 'grid', gap: '14px' }}>
        <div>
          <label className="lbl">{t.fName} *</label>
          <input className="inp" placeholder={t.fNamePh} value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="err">{errors.name}</p>}
        </div>
        <div>
          <label className="lbl">{t.fPhone} *</label>
          <input className="inp" placeholder={t.fPhonePh} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          {phone.replace(/\D/g, '').length >= 11 && !errors.phone && (
            <p style={{ color: '#a6f36a', fontSize: '12.5px', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}><Icon name="check" size={13} strokeWidth={3} />OK</p>
          )}
          {errors.phone && <p className="err">{errors.phone}</p>}
        </div>
        <div>
          <label className="lbl">{t.fTelegram}</label>
          <input className="inp" placeholder={t.fTelegramPh} value={telegram} onChange={(e) => setTelegram(e.target.value)} />
        </div>
      </div>

      {items.filter((p) => p.infoForm).map((p) => (
        <div key={p.id} className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '16px', borderColor: 'rgba(166,243,106,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15.5px', marginBottom: '14px' }}>
            <Icon name="gift" size={18} color="#a6f36a" />{t.bdayTitle} — {p.title}
          </div>
          <BdayForm t={t} value={bday[p.id] || {}} onChange={(v) => { setBday((prev) => ({ ...prev, [p.id]: v })); try { localStorage.setItem('tbcx_bday_' + p.id, JSON.stringify(v)); } catch {} }} />
          {errors['bday_' + p.id] && <p className="err">{errors['bday_' + p.id]}</p>}
        </div>
      ))}

      {bumpProduct && (
        <button type="button" onClick={() => setBumpId(bumpId ? null : bumpProduct.id)} style={{ width: '100%', textAlign: 'left', marginTop: '16px', padding: '14px 15px', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', background: bumpId ? 'rgba(166,243,106,0.07)' : 'rgba(255,255,255,0.03)', border: bumpId ? '1px solid rgba(166,243,106,0.55)' : '1px solid var(--line)', display: 'flex', gap: '13px', alignItems: 'center' }}>
          <img src={bumpProduct.image} alt="" style={{ width: '52px', height: '52px', borderRadius: '11px', objectFit: 'cover' }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.5px' }}>{t.bumpTitle}</span>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '14px', marginTop: '3px' }}>{bumpProduct.title}</span>
          </span>
          <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{fmtBdt(bumpProduct.price, lang)}</span>
          <span style={{ width: '22px', height: '22px', borderRadius: '7px', border: bumpId ? 'none' : '2px solid #475569', background: bumpId ? '#a6f36a' : 'transparent', display: 'grid', placeItems: 'center', color: '#10170c', flexShrink: 0 }}>
            {bumpId && <Icon name="check" size={14} strokeWidth={3.2} />}
          </span>
        </button>
      )}

      <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '16px' }}>
        {bumpId && bumpProduct && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', padding: '5px 0', color: '#cbd5e1' }}>
            <span>{bumpProduct.title}</span><span style={{ fontWeight: 700 }}>{fmtBdt(bumpProduct.price, lang)}</span>
          </div>
        )}
        {items.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', padding: '5px 0', color: '#cbd5e1' }}>
            <span>{p.title}</span><span style={{ fontWeight: 700 }}>{fmtBdt(p.price, lang)}</span>
          </div>
        ))}
        {vip && vip.available && !couponCode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '5px 0', color: '#a6f36a', fontWeight: 700 }}>
            <span>{t.vipReward}</span><span>−{fmtBdt(vip.discount, lang)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--line)', marginTop: '10px', paddingTop: '11px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16.5px' }}>
          <span>{t.total}</span><span style={{ color: 'var(--accent)' }}>{fmtBdt(subtotal - (couponCode ? couponDiscount : vip && vip.available ? vip.discount : 0), lang)}</span>
        </div>
        {vip && vip.available && !couponCode && <p style={{ color: '#a6f36a', fontSize: '12.5px', fontWeight: 700, marginTop: '7px' }}>{t.vipReady}</p>}
        {vip && !vip.available && vip.remaining > 0 && vip.completed > 0 && <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '7px' }}>{t.vipNext.replace('{n}', String(vip.remaining))}</p>}
        {!couponCode ? (
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="inp" placeholder={t.couponPh} value={couponInput} onChange={(e) => setCouponInput(e.target.value)} style={{ flex: 1, padding: '10px 13px', fontSize: '13.5px' }} />
              <button type="button" className="btn-ghost" style={{ padding: '9px 15px', fontSize: '13px' }} onClick={async () => {
                const res = await fetch('/api/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponInput, subtotal }) }).catch(() => null);
                const d = res ? await res.json().catch(() => null) : null;
                if (d && d.ok) { setCouponCode(d.code); setCouponDiscount(d.discount); setCouponMsg(t.couponOk); try { localStorage.setItem('tbcx_coupon', d.code); } catch {} }
                else setCouponMsg(t.couponBad);
              }}>{t.couponApply}</button>
            </div>
            {couponMsg && <p style={{ color: '#fca5a5', fontSize: '12.5px', fontWeight: 700, marginTop: '7px' }}>{couponMsg}</p>}
          </div>
        ) : (
          <p style={{ color: '#a6f36a', fontSize: '13px', fontWeight: 700, marginTop: '10px' }}>{t.discount}: {couponCode} −{fmtBdt(couponDiscount, lang)}</p>
        )}
      </div>

      {fail && <p className="err" style={{ marginTop: '12px' }}>{fail}</p>}
      <button className="btn-lime" style={{ width: '100%', justifyContent: 'center', marginTop: '18px' }} onClick={place} disabled={placing}>
        <Icon name="lock" size={16} />{placing ? t.placing : t.placeOrder}
      </button>
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12.5px', marginTop: '11px' }}>{t.trustLine}</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  );
}
