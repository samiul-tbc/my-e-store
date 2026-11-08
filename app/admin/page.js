'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/icons';
import Logo from '../../components/Logo';

const STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const ST_LABEL = { pending: 'পেন্ডিং', processing: 'প্রসেসিং', completed: 'সম্পন্ন', cancelled: 'বাতিল' };
const ST_STYLE = {
  pending: { bg: 'rgba(251,191,36,0.13)', bd: 'rgba(251,191,36,0.45)', fg: '#fcd34d' },
  processing: { bg: 'rgba(56,189,248,0.13)', bd: 'rgba(56,189,248,0.45)', fg: '#7dd3fc' },
  completed: { bg: 'rgba(166,243,106,0.13)', bd: 'rgba(166,243,106,0.45)', fg: '#a6f36a' },
  cancelled: { bg: 'rgba(239,68,68,0.13)', bd: 'rgba(239,68,68,0.45)', fg: '#fca5a5' },
};
const last10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);
const waNum = (s) => { const d = String(s || '').replace(/\D/g, ''); return d.startsWith('880') ? d : '880' + d.slice(-10); };

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [pin, setPin] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(false);

  const api = useCallback(async (action, extra = {}, tok) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': tok || token },
      body: JSON.stringify({ action, ...extra }),
    }).catch(() => null);
    if (!res) return null;
    return res.json().catch(() => null);
  }, [token]);

  const loadData = useCallback(async (tok) => {
    setLoading(true);
    const d = await api('data', {}, tok);
    if (d && d.ok) setData(d);
    setLoading(false);
  }, [api]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('tbcx_admin_token');
      if (saved) { setToken(saved); loadData(saved); }
    } catch {}
  }, [loadData]);

  const login = async () => {
    setAuthErr('');
    const res = await fetch('/api/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', pin }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => null) : null;
    if (d && d.ok) {
      setToken(d.token);
      try { sessionStorage.setItem('tbcx_admin_token', d.token); } catch {}
      if (d.first) setAuthErr('PIN সেট হয়েছে — এটা মনে রাখবেন');
      loadData(d.token);
    } else setAuthErr('PIN ভুল হয়েছে');
  };

  if (!token) {
    return (
      <div className="wrap" style={{ padding: '60px 0', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center' }}><Logo size={44} /></div>
        <div className="glass" style={{ padding: '24px', marginTop: '24px', borderRadius: '18px' }}>
          <div style={{ fontWeight: 800, fontSize: '17px', textAlign: 'center' }}>Admin Panel</div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', marginTop: '6px', lineHeight: 1.6 }}>
            প্রথমবার হলে এখানে দেওয়া PIN-টাই সেট হবে — পরে Settings থেকে বদলানো যাবে।
          </p>
          <input className="inp" type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') login(); }} style={{ marginTop: '16px', textAlign: 'center', letterSpacing: '4px' }} />
          {authErr && <p className="err" style={{ textAlign: 'center' }}>{authErr}</p>}
          <button className="btn-lime" style={{ width: '100%', justifyContent: 'center', marginTop: '14px' }} onClick={login}>
            <Icon name="lock" size={16} />Login
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    ['orders', 'অর্ডার', 'package'],
    ['products', 'প্রোডাক্ট', 'grid'],
    ['coupons', 'কুপন', 'tag'],
    ['delivery', 'ডেলিভারি', 'download'],
    ['reviews', 'রিভিউ', 'star'],
    ['customers', 'কাস্টমার', 'users'],
    ['insights', 'ইনসাইট', 'chart'],
    ['settings', 'সেটিংস', 'settings'],
  ];

  return (
    <div className="wrap" style={{ padding: '24px 0 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, fontFamily: "'Manrope','Hind Siliguri',sans-serif" }}>TBC × E-store — Admin</h1>
        <button className="btn-ghost" style={{ padding: '9px 15px', fontSize: '13px' }} onClick={() => loadData()} disabled={loading}>
          <Icon name="refresh" size={15} />{loading ? 'লোড হচ্ছে...' : 'রিফ্রেশ'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 2px 6px', scrollbarWidth: 'none' }}>
        {TABS.map(([k, label, icon]) => (
          <button key={k} className={'admin-tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
            <Icon name={icon} size={15} />{label}
            {k === 'orders' && data && data.orders.some((o) => o.status === 'pending') && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, minWidth: '17px', height: '17px', borderRadius: '999px', display: 'grid', placeItems: 'center', padding: '0 4px' }}>
                {data.orders.filter((o) => o.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {!data ? (
        <p style={{ color: 'var(--muted)', marginTop: '26px' }}>{loading ? 'লোড হচ্ছে...' : 'ডেটা লোড হয়নি — রিফ্রেশ চাপুন'}</p>
      ) : (
        <>
          {tab === 'orders' && <OrdersTab data={data} api={api} reload={() => loadData()} />}
          {tab === 'products' && <ProductsTab data={data} api={api} reload={() => loadData()} />}
          {tab === 'coupons' && <CouponsTab data={data} api={api} reload={() => loadData()} />}
          {tab === 'delivery' && <DeliveryTab data={data} api={api} reload={() => loadData()} />}
          {tab === 'reviews' && <ReviewsTab data={data} api={api} reload={() => loadData()} />}
          {tab === 'customers' && <CustomersTab data={data} />}
          {tab === 'insights' && <InsightsTab data={data} />}
          {tab === 'settings' && <SettingsTab data={data} api={api} reload={() => loadData()} setToken={setToken} />}
        </>
      )}
    </div>
  );
}

function OrdersTab({ data, api, reload }) {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tgMsg, setTgMsg] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('completed');
  const [noteEdit, setNoteEdit] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [noteText, setNoteText] = useState('');
  const toggleSel = (oid) => setSelected((prev) => prev.includes(oid) ? prev.filter((x) => x !== oid) : [...prev, oid]);
  const applyBulk = async () => {
    for (const oid of selected) await api('set-status', { orderId: oid, status: bulkStatus });
    setSelected([]);
    reload();
  };
  const [notify, setNotify] = useState(null);
  const orders = data.orders || [];
  const trxCount = {};
  for (const o of orders) if (o.trx_id) trxCount[o.trx_id] = (trxCount[o.trx_id] || 0) + 1;
  const dupeInAll = {};
  {
    const allCount = {};
    for (const o of orders) if (o.trx_id) allCount[o.trx_id] = (allCount[o.trx_id] || 0) + 1;
    for (const k of Object.keys(allCount)) if (allCount[k] > 1) dupeInAll[k] = true;
  }
  void trxCount;
  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    const str = (o.order_id + ' ' + o.customer_name + ' ' + o.whatsapp_number + ' ' + o.service_name + ' ' + (o.trx_id || '')).toLowerCase();
    return str.includes(q.toLowerCase());
  });

  const setStatus = async (o, status) => {
    const d = await api('set-status', { orderId: o.order_id, status });
    if (d && d.ok) {
      const phone = waNum(o.whatsapp_number);
      const msg = status === 'completed'
        ? `আসসালামু আলাইকুম ${o.customer_name}, আপনার অর্ডার ${o.order_id} (${o.service_name}) সম্পন্ন হয়েছে। Track Order পেজে ডেলিভারি পেয়ে যাবেন: ${typeof window !== 'undefined' ? window.location.origin : ''}/track — TBC × E-store`
        : status === 'processing'
          ? `আসসালামু আলাইকুম ${o.customer_name}, আপনার অর্ডার ${o.order_id} (${o.service_name}) প্রসেসিং চলছে। শীঘ্রই সম্পন্ন হবে — TBC × E-store`
          : status === 'cancelled'
            ? `আসসালামু আলাইকুম ${o.customer_name}, দুঃখিত — আপনার অর্ডার ${o.order_id} বাতিল করা হয়েছে। প্রয়োজনে যোগাযোগ করুন — TBC × E-store`
            : '';
      if (msg) setNotify({ phone, msg, orderId: o.order_id });
      reload();
    }
  };

  return (
    <div style={{ marginTop: '14px' }}>
      {notify && (
        <div style={{ background: 'rgba(166,243,106,0.08)', border: '1px solid rgba(166,243,106,0.4)', borderRadius: '14px', padding: '14px 16px', marginBottom: '14px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 700, flex: 1, minWidth: '200px' }}>{notify.orderId} — status change hoyeche. Customer-ke WhatsApp-e janaben?</span>
          <a className="btn-lime" style={{ padding: '9px 16px', fontSize: '13.5px' }} target="_blank" rel="noreferrer" href={`https://wa.me/${notify.phone}?text=${encodeURIComponent(notify.msg)}`}>
            <Icon name="message" size={15} />WhatsApp পাঠান
          </a>
          <button className="btn-ghost" style={{ padding: '9px 13px', fontSize: '13px' }} onClick={() => setNotify(null)}>বাদ দিন</button>
        </div>
      )}
      <div style={{ position: 'relative', maxWidth: '420px' }}>
        <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'inline-flex' }}><Icon name="search" size={16} /></span>
        <input className="inp" style={{ paddingLeft: '40px' }} placeholder="Order ID, নাম, নম্বর, TrxID খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginTop: '13px' }}>
        {['all', ...STATUSES].map((st) => (
          <button key={st} className={'admin-tab' + (statusFilter === st ? ' on' : '')} style={{ padding: '7px 13px', fontSize: '12.5px' }} onClick={() => setStatusFilter(st)}>
            {st === 'all' ? 'সব' : ST_LABEL[st]} ({st === 'all' ? orders.length : orders.filter((o) => o.status === st).length})
          </button>
        ))}
        <button className="btn-ghost" style={{ padding: '7px 13px', fontSize: '12.5px' }} onClick={async () => {
          const d = await api('test-telegram');
          setTgMsg(!d ? 'সার্ভার এরর' : !d.configured ? 'Telegram env (BOT_TOKEN/CHAT_ID) Vercel-এ set করা নেই' : d.ok ? 'Test alert পাঠানো হয়েছে' : 'পাঠানো যায়নি — টোকেন/চ্যাট আইডি চেক করুন');
        }}><Icon name="send" size={13} />Telegram Test</button>
        {tgMsg && <span style={{ fontSize: '12.5px', color: 'var(--muted)', alignSelf: 'center' }}>{tgMsg}</span>}
      </div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', gap: '9px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.35)', padding: '10px 13px', borderRadius: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800 }}>{selected.length}টি সিলেক্ট করা</span>
          <select className="inp" style={{ width: '140px', padding: '8px 10px', fontSize: '13px' }} value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            {STATUSES.map((st) => <option key={st} value={st}>{ST_LABEL[st]}</option>)}
          </select>
          <button className="btn-lime" style={{ padding: '8px 15px', fontSize: '13px' }} onClick={applyBulk}>সবগুলোতে প্রয়োগ</button>
          <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '12.5px' }} onClick={() => setSelected([])}>বাদ দিন</button>
        </div>
      )}
      <button className="btn-ghost" style={{ padding: '9px 15px', fontSize: '13px', marginTop: '13px' }} onClick={() => {
        const rows = [['Order ID', 'Date', 'Customer', 'Phone', 'Service', 'Price', 'Method', 'TrxID', 'Status']];
        for (const o of filtered) rows.push([o.order_id, o.created_at || '', o.customer_name, o.whatsapp_number, o.service_name, o.price, o.payment_method || '', o.trx_id || '', o.status]);
        const csv = rows.map((r) => r.map((c) => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'estore-orders.csv';
        a.click();
        URL.revokeObjectURL(a.href);
      }}><Icon name="download" size={15} />CSV এক্সপোর্ট</button>
      <div style={{ display: 'grid', gap: '11px', marginTop: '16px' }}>
        {filtered.map((o) => {
          const st = ST_STYLE[o.status] || ST_STYLE.pending;
          const dupe = o.trx_id && dupeInAll[o.trx_id];
          return (
            <div key={o.id} className="glass" style={{ padding: '15px 16px', borderRadius: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '200px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selected.includes(o.order_id)} onChange={() => toggleSel(o.order_id)} style={{ width: '16px', height: '16px', accentColor: '#a6f36a' }} />
                    <span style={{ fontFamily: "'Manrope',monospace", fontWeight: 800, color: '#a6f36a', fontSize: '15px' }}>{o.order_id}</span>
                  </label>
                  <span className="status-pill" style={{ background: st.bg, border: '1px solid ' + st.bd, color: st.fg, marginLeft: '9px' }}>{ST_LABEL[o.status] || o.status}</span>
                  {dupe && <span className="status-pill" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5', marginLeft: '6px' }}>Duplicate TrxID!</span>}
                  <div style={{ fontWeight: 700, fontSize: '14.5px', marginTop: '6px' }}>{o.service_name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '3px', lineHeight: 1.65 }}>
                    {o.customer_name} • {o.whatsapp_number}{o.telegram_username ? ' • ' + o.telegram_username : ''}<br />
                    ৳{o.price} • {o.payment_method || 'পেমেন্ট হয়নি'}{o.trx_id ? ' • TrxID: ' + o.trx_id : ''}<br />
                    {o.created_at ? new Date(o.created_at).toLocaleString('bn-BD') : ''}
                  </div>
                  {data.notes && data.notes[o.order_id] && noteEdit !== o.order_id && (
                    <div style={{ marginTop: '7px', fontSize: '12.5px', color: '#fcd34d', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', padding: '6px 9px', borderRadius: '8px', maxWidth: '420px' }}>নোট: {data.notes[o.order_id]}</div>
                  )}
                  {noteEdit === o.order_id ? (
                    <div style={{ display: 'flex', gap: '7px', marginTop: '8px', maxWidth: '440px' }}>
                      <input className="inp" style={{ padding: '8px 11px', fontSize: '13px' }} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="অভ্যন্তরীণ নোট..." />
                      <button className="btn-lime" style={{ padding: '8px 13px', fontSize: '12.5px' }} onClick={async () => { await api('save-note', { orderId: o.order_id, note: noteText }); setNoteEdit(null); reload(); }}>সেভ</button>
                    </div>
                  ) : (
                    <button onClick={() => { setNoteEdit(o.order_id); setNoteText((data.notes && data.notes[o.order_id]) || ''); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '5px 0 0', fontFamily: 'inherit' }}>
                      {data.notes && data.notes[o.order_id] ? 'নোট এডিট' : '+ নোট যোগ করুন'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                  <select className="inp" style={{ padding: '9px 11px', fontSize: '13.5px', width: '150px' }} value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{ST_LABEL[s]}</option>)}
                  </select>
                  <a className="btn-ghost" style={{ padding: '8px 12px', fontSize: '12.5px', justifyContent: 'center' }} target="_blank" rel="noreferrer" href={`https://wa.me/${waNum(o.whatsapp_number)}`}>
                    <Icon name="message" size={14} />WhatsApp
                  </a>
                  <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '12.5px', justifyContent: 'center' }} onClick={() => setDrawer(o)}>
                    <Icon name="eye" size={14} />বিস্তারিত
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p style={{ color: 'var(--muted)' }}>কোনো অর্ডার নেই</p>}
      </div>

      {drawer && (() => {
        const o = drawer;
        const bd = data.bday ? data.bday[o.order_id] : null;
        const trackUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/track?q=' + o.order_id;
        const resendMsg = o.status === 'completed'
          ? `আসসালামু আলাইকুম ${o.customer_name}, আপনার অর্ডার ${o.order_id} (${o.service_name})-এর ডেলিভারি তৈরি।\nTrack: ${trackUrl}${bd ? '\nকার্ডের লিংক: ' + bd.link : ''}\n— TBC × E-store`
          : `আসসালামু আলাইকুম ${o.customer_name}, আপনার অর্ডার ${o.order_id} (${o.service_name})-এর অবস্থা: ${ST_LABEL[o.status] || o.status}।\nTrack: ${trackUrl}\n— TBC × E-store`;
        const row = (k, v) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', fontSize: '13.5px', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{k}</span>
            <span style={{ fontWeight: 700, textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
          </div>
        );
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 85, background: 'rgba(3,5,8,0.7)', backdropFilter: 'blur(5px)' }} onClick={() => setDrawer(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 'min(430px, 94vw)', background: '#0c1119', borderLeft: '1px solid var(--line)', padding: '22px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Manrope',monospace", fontWeight: 800, color: '#a6f36a', fontSize: '17px' }}>{o.order_id}</span>
                <button onClick={() => setDrawer(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" size={21} /></button>
              </div>
              <div style={{ marginTop: '14px' }}>
                {row('কাস্টমার', o.customer_name)}
                {row('WhatsApp', o.whatsapp_number)}
                {o.telegram_username ? row('Telegram', o.telegram_username) : null}
                {row('সার্ভিস', o.service_name)}
                {row('মূল্য', '৳' + o.price)}
                {row('পেমেন্ট', (o.payment_method || '—') + (o.trx_id ? ' • ' + o.trx_id : ''))}
                {row('স্ট্যাটাস', ST_LABEL[o.status] || o.status)}
                {row('তারিখ', o.created_at ? new Date(o.created_at).toLocaleString('bn-BD') : '—')}
                {data.dlUsed && data.dlUsed[o.order_id] ? row('ডাউনলোড ব্যবহার', data.dlUsed[o.order_id] + ' বার') : null}
                {data.notes && data.notes[o.order_id] ? row('নোট', data.notes[o.order_id]) : null}
              </div>
              {bd && (
                <div style={{ marginTop: '16px', background: 'rgba(166,243,106,0.06)', border: '1px solid rgba(166,243,106,0.3)', borderRadius: '13px', padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#a6f36a', marginBottom: '9px' }}>বার্থডে কার্ডের তথ্য</div>
                  {row('যার জন্মদিন', bd.payload.name || '—')}
                  {row('জন্ম তারিখ', bd.payload.birth || '—')}
                  {row('সম্পর্ক', bd.payload.rel || '—')}
                  {row('থিম', bd.payload.theme || '—')}
                  {row('প্রেরক', bd.payload.from || '—')}
                  {bd.payload.msg ? row('বার্তা', bd.payload.msg) : null}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <a className="btn-lime" style={{ padding: '9px 15px', fontSize: '13px' }} href={bd.link} target="_blank" rel="noreferrer"><Icon name="external" size={14} />কার্ড খুলুন</a>
                    <button className="btn-ghost" style={{ padding: '9px 13px', fontSize: '12.5px' }} onClick={() => { try { navigator.clipboard.writeText(bd.link); } catch {} }}><Icon name="copy" size={13} />লিংক কপি</button>
                  </div>
                </div>
              )}
              <a className="btn-lime" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} href={`https://wa.me/${waNum(o.whatsapp_number)}?text=${encodeURIComponent(resendMsg)}`} target="_blank" rel="noreferrer">
                <Icon name="message" size={16} />WhatsApp-এ ডেলিভারি পাঠান
              </a>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function ProductsTab({ data, api, reload }) {
  const [products, setProducts] = useState(data.products || []);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { setProducts(data.products || []); }, [data]);

  const save = async (list) => {
    const d = await api('save-products', { products: list });
    setMsg(d && d.ok ? 'সেভ হয়েছে' : 'সেভ হয়নি — আবার চেষ্টা করুন');
    if (d && d.ok) reload();
  };
  const patch = (id, fields) => setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));

  const blank = { id: 'service-' + Date.now().toString().slice(-6), title: '', price: 0, oldPrice: 0, image: '', type: 'link', infoForm: false, published: true, featured: false, tagline: { bn: '', en: '' }, bullets: { bn: [], en: [] }, downloadFile: '', downloadName: '', downloadLimit: 3 };

  return (
    <div style={{ marginTop: '14px' }}>
      <div style={{ display: 'flex', gap: '9px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn-lime" style={{ padding: '10px 17px', fontSize: '14px' }} onClick={() => setEdit({ ...blank })}><Icon name="plus" size={15} />নতুন প্রোডাক্ট</button>
        <button className="btn-ghost" style={{ padding: '10px 16px', fontSize: '13.5px' }} onClick={() => save(products)}>সব সেভ করুন</button>
        {msg && <span style={{ color: '#a6f36a', fontSize: '13px', fontWeight: 700 }}>{msg}</span>}
      </div>
      <div style={{ display: 'grid', gap: '11px', marginTop: '16px' }}>
        {products.map((p) => (
          <div key={p.id} className="glass" style={{ padding: '14px 16px', borderRadius: '15px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', opacity: p.published === false ? 0.55 : 1 }}>
            <img src={p.image} alt="" style={{ width: '58px', height: '58px', borderRadius: '11px', objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: '170px' }}>
              <div style={{ fontWeight: 800, fontSize: '14.5px' }}>{p.title || '(নাম নেই)'} {p.published === false && <span style={{ color: '#fca5a5', fontSize: '11px', fontWeight: 800 }}>HIDDEN</span>}</div>
              <div style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '3px' }}>৳{p.price}{p.oldPrice > p.price ? ' • আগের ৳' + p.oldPrice : ''} • {p.type}{p.infoForm ? ' • তথ্য ফর্ম' : ''}</div>
            </div>
            <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '3px' }}>
              <button aria-label="move up" onClick={() => { const i = products.findIndex((x) => x.id === p.id); if (i > 0) { const next = [...products]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; setProducts(next); } }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: '#cbd5e1', borderRadius: '6px', width: '24px', height: '17px', cursor: 'pointer', fontSize: '10px', lineHeight: 1 }}>▲</button>
              <button aria-label="move down" onClick={() => { const i = products.findIndex((x) => x.id === p.id); if (i < products.length - 1) { const next = [...products]; [next[i + 1], next[i]] = [next[i], next[i + 1]]; setProducts(next); } }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: '#cbd5e1', borderRadius: '6px', width: '24px', height: '17px', cursor: 'pointer', fontSize: '10px', lineHeight: 1 }}>▼</button>
            </span>
            <Toggle label="Published" on={p.published !== false} onClick={() => patch(p.id, { published: p.published === false ? true : false })} />
            <Toggle label="Featured" on={!!p.featured} onClick={() => patch(p.id, { featured: !p.featured })} />
            <button className="btn-ghost" style={{ padding: '8px 13px', fontSize: '13px' }} onClick={() => setEdit(JSON.parse(JSON.stringify(p)))}><Icon name="edit" size={14} />এডিট</button>
            <button className="btn-ghost" style={{ padding: '8px 11px', fontSize: '13px' }} title="ক্লোন" onClick={() => { const c = JSON.parse(JSON.stringify(p)); c.id = p.id + '-copy'; c.title = p.title + ' (Copy)'; c.published = false; setProducts((prev) => [...prev, c]); }}><Icon name="copy" size={14} /></button>
            <button aria-label="delete" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', width: '36px', height: '36px', borderRadius: '11px', display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setProducts((prev) => prev.filter((x) => x.id !== p.id))}>
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}
      </div>

      {edit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,5,8,0.78)', backdropFilter: 'blur(6px)', zIndex: 80, overflowY: 'auto', padding: '20px 12px' }} onClick={() => setEdit(null)}>
          <div className="glass" style={{ maxWidth: '620px', margin: '0 auto', padding: '22px', borderRadius: '18px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '16.5px' }}>প্রোডাক্ট এডিট</div>
              <button onClick={() => setEdit(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              <Field label="Slug / ID"><input className="inp" value={edit.id} onChange={(e) => setEdit({ ...edit, id: e.target.value })} /></Field>
              <Field label="Title"><input className="inp" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Price (৳)"><input className="inp" type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Field>
                <Field label="Old price (৳)"><input className="inp" type="number" value={edit.oldPrice || 0} onChange={(e) => setEdit({ ...edit, oldPrice: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Image URL / path"><input className="inp" value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} /></Field>
              <Field label="Extra images (এক লাইনে একটা URL — gallery)"><textarea className="inp" rows={2} value={(edit.images || []).join('\n')} onChange={(e) => setEdit({ ...edit, images: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="ধরন (type)">
                  <select className="inp" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>
                    <option value="link">link (কার্ড/লিংক)</option>
                    <option value="download">download (ফাইল)</option>
                    <option value="text">text (fixed text)</option>
                  </select>
                </Field>
                <Field label="তথ্য ফর্ম (checkout)">
                  <select className="inp" value={edit.infoForm ? 'yes' : 'no'} onChange={(e) => setEdit({ ...edit, infoForm: e.target.value === 'yes' })}>
                    <option value="no">না</option>
                    <option value="yes">হ্যাঁ (birthday form)</option>
                  </select>
                </Field>
              </div>
              {edit.type === 'download' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <Field label="ফাইলের নাম (delivery-private)"><input className="inp" value={edit.downloadFile || ''} onChange={(e) => setEdit({ ...edit, downloadFile: e.target.value })} /></Field>
                  <Field label="ডাউনলোড নাম"><input className="inp" value={edit.downloadName || ''} onChange={(e) => setEdit({ ...edit, downloadName: e.target.value })} /></Field>
                  <Field label="লিমিট"><input className="inp" type="number" value={edit.downloadLimit || 3} onChange={(e) => setEdit({ ...edit, downloadLimit: Number(e.target.value) })} /></Field>
                </div>
              )}
              <Field label="Tagline (বাংলা)"><input className="inp" value={edit.tagline?.bn || ''} onChange={(e) => setEdit({ ...edit, tagline: { ...edit.tagline, bn: e.target.value } })} /></Field>
              <Field label="Tagline (English)"><input className="inp" value={edit.tagline?.en || ''} onChange={(e) => setEdit({ ...edit, tagline: { ...edit.tagline, en: e.target.value } })} /></Field>
              <Field label="Bullets (বাংলা — প্রতি লাইনে একটা)"><textarea className="inp" rows={4} value={(edit.bullets?.bn || []).join('\n')} onChange={(e) => setEdit({ ...edit, bullets: { ...edit.bullets, bn: e.target.value.split('\n') } })} /></Field>
              <Field label="Bullets (English — one per line)"><textarea className="inp" rows={4} value={(edit.bullets?.en || []).join('\n')} onChange={(e) => setEdit({ ...edit, bullets: { ...edit.bullets, en: e.target.value.split('\n') } })} /></Field>
            </div>
            <button className="btn-lime" style={{ width: '100%', justifyContent: 'center', marginTop: '18px' }} onClick={() => {
              setProducts((prev) => {
                const exists = prev.some((x) => x.id === edit.id);
                return exists ? prev.map((x) => (x.id === edit.id ? edit : x)) : [...prev, edit];
              });
              setEdit(null);
            }}>তালিকায় রাখুন (পরে সব সেভ করুন)</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, on, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 700 }}>
      <span style={{ width: '38px', height: '21px', borderRadius: '999px', background: on ? '#a6f36a' : '#334155', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: '2.5px', left: on ? '19px' : '3px', width: '16px', height: '16px', borderRadius: '999px', background: '#fff', transition: 'left 0.2s' }} />
      </span>
      {label}
    </button>
  );
}

function CouponsTab({ data, api, reload }) {
  const [coupons, setCoupons] = useState(data.coupons || []);
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState(10);
  const [expires, setExpires] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => { setCoupons(data.coupons || []); }, [data]);
  const save = async (list) => {
    const d = await api('save-coupons', { coupons: list });
    setMsg(d && d.ok ? 'সেভ হয়েছে' : 'সেভ হয়নি');
    if (d && d.ok) reload();
  };
  return (
    <div style={{ marginTop: '14px', maxWidth: '560px' }}>
      <div className="glass" style={{ padding: '16px', borderRadius: '15px', display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
        <input className="inp" placeholder="কোড (যেমন NEW10)" value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: 2, minWidth: '140px' }} />
        <input className="inp" type="number" placeholder="%" value={percent} onChange={(e) => setPercent(Number(e.target.value))} style={{ flex: 1, minWidth: '70px' }} />
        <input className="inp" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} style={{ flex: 1, minWidth: '130px' }} title="মেয়াদ (যদি থাকে)" />
        <button className="btn-lime" style={{ padding: '11px 18px', fontSize: '14px' }} onClick={() => {
          if (!code.trim()) return;
          const list = [...coupons, { code: code.trim().toUpperCase(), percent: Math.max(1, Math.min(90, percent || 0)), active: true, expiresAt: expires || undefined }];
          setCoupons(list); setCode(''); save(list);
        }}><Icon name="plus" size={15} />যোগ করুন</button>
      </div>
      {msg && <p style={{ color: '#a6f36a', fontSize: '13px', fontWeight: 700, marginTop: '10px' }}>{msg}</p>}
      <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
        {coupons.map((c, i) => (
          <div key={i} className="glass" style={{ padding: '13px 16px', borderRadius: '13px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: "'Manrope',monospace", fontWeight: 800, fontSize: '15px', color: '#a6f36a' }}>{c.code}</span>
            <span style={{ color: 'var(--muted)', fontSize: '13.5px' }}>{c.percent}% ছাড়{c.expiresAt ? ' • মেয়াদ: ' + c.expiresAt : ''}</span>
            <span style={{ marginLeft: 'auto' }} />
            <Toggle label={c.active === false ? 'বন্ধ' : 'চালু'} on={c.active !== false} onClick={() => { const list = coupons.map((x, j) => j === i ? { ...x, active: x.active === false ? true : false } : x); setCoupons(list); save(list); }} />
            <button aria-label="delete" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', width: '34px', height: '34px', borderRadius: '10px', display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => { const list = coupons.filter((_, j) => j !== i); setCoupons(list); save(list); }}>
              <Icon name="trash" size={14} />
            </button>
          </div>
        ))}
        {coupons.length === 0 && <p style={{ color: 'var(--muted)' }}>কোনো কুপন নেই</p>}
      </div>
    </div>
  );
}

function DeliveryTab({ data, api }) {
  const [texts, setTexts] = useState({});
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const init = {};
    for (const p of data.products || []) init[p.id] = data.autodelivery && data.autodelivery[p.id] ? data.autodelivery[p.id].fixedText || '' : '';
    setTexts(init);
  }, [data]);
  const save = async (pid) => {
    const d = await api('save-autodelivery', { productId: pid, fixedText: texts[pid] || '' });
    setMsg(d && d.ok ? 'সেভ হয়েছে' : 'সেভ হয়নি');
  };
  return (
    <div style={{ marginTop: '14px', display: 'grid', gap: '13px', maxWidth: '640px' }}>
      <p style={{ color: 'var(--muted)', fontSize: '13.5px', lineHeight: 1.7 }}>
        কার্ড (link) প্রোডাক্টের ডেলিভারি অটো — অর্ডারের তথ্য থেকে লিংক তৈরি হয়। download প্রোডাক্টের ডেলিভারিও অটো — Track পেজে গেটেড ডাউনলোড বাটন। text ধরনের প্রোডাক্টের জন্য নিচে fixed text সেট করুন — completed অর্ডারে Track পেজে এটাই দেখাবে।
      </p>
      {(data.products || []).map((p) => (
        <div key={p.id} className="glass" style={{ padding: '16px', borderRadius: '15px' }}>
          <div style={{ fontWeight: 800, fontSize: '14.5px' }}>{p.title} <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '12.5px' }}>({p.type})</span></div>
          <textarea className="inp" rows={3} style={{ marginTop: '10px', resize: 'vertical' }} placeholder="Fixed delivery text..." value={texts[p.id] || ''} onChange={(e) => setTexts({ ...texts, [p.id]: e.target.value })} />
          <button className="btn-ghost" style={{ padding: '9px 15px', fontSize: '13px', marginTop: '10px' }} onClick={() => save(p.id)}>সেভ করুন</button>
        </div>
      ))}
      {msg && <p style={{ color: '#a6f36a', fontSize: '13px', fontWeight: 700 }}>{msg}</p>}
    </div>
  );
}

function ReviewsTab({ data, api, reload }) {
  const products = data.products || [];
  return (
    <div style={{ marginTop: '14px', display: 'grid', gap: '18px' }}>
      {products.map((p) => {
        const list = (data.reviews && data.reviews[p.id]) || [];
        return (
          <div key={p.id}>
            <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '9px' }}>{p.title} <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '12.5px' }}>({list.length} রিভিউ)</span></div>
            <div style={{ display: 'grid', gap: '9px' }}>
              {list.map((r, i) => (
                <div key={i} className="glass" style={{ padding: '12px 15px', borderRadius: '13px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 800, fontSize: '13.5px' }}>{r.name}</span>
                    <span className="stars" style={{ marginLeft: '8px' }}>{'★'.repeat(r.rating || 5)}</span>
                    <p style={{ color: '#cbd5e1', fontSize: '13.5px', marginTop: '4px', lineHeight: 1.6 }}>{r.text}</p>
                  </div>
                  <button aria-label="delete review" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', width: '32px', height: '32px', borderRadius: '9px', display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={async () => { await api('delete-review', { productId: p.id, ts: r.ts }); reload(); }}>
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              ))}
              {list.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '13px' }}>রিভিউ নেই</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CustomersTab({ data }) {
  const map = useMemo(() => {
    const m = {};
    for (const o of data.orders || []) {
      const k = last10(o.whatsapp_number);
      if (!k) continue;
      if (!m[k]) m[k] = { phone: o.whatsapp_number, name: o.customer_name, count: 0, spent: 0, last: o.created_at };
      m[k].count += 1;
      if (o.status === 'completed') m[k].spent += Number(o.price) || 0;
      if (o.created_at > m[k].last) m[k].last = o.created_at;
    }
    return Object.values(m).sort((a, b) => b.spent - a.spent || b.count - a.count);
  }, [data]);
  const [q, setQ] = useState('');
  const filtered = map.filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ marginTop: '14px', maxWidth: '640px' }}>
      <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
        <input className="inp" placeholder="নাম বা নম্বর খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: '380px', flex: 1 }} />
        <button className="btn-ghost" style={{ padding: '10px 15px', fontSize: '13px' }} onClick={() => {
          const rows = [['Name', 'Phone', 'Orders', 'Completed spend', 'Last order']];
          for (const c of map) rows.push([c.name, c.phone, c.count, c.spent, c.last || '']);
          const csv = rows.map((r) => r.map((x) => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(',')).join('\n');
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
          a.download = 'estore-customers.csv';
          a.click();
          URL.revokeObjectURL(a.href);
        }}><Icon name="download" size={14} />CSV</button>
      </div>
      <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
        {filtered.map((c) => (
          <div key={c.phone} className="glass" style={{ padding: '13px 16px', borderRadius: '13px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '170px' }}>
              <div style={{ fontWeight: 800, fontSize: '14.5px' }}>{c.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '2px' }}>{c.phone} • {c.count} অর্ডার • শেষ: {c.last ? new Date(c.last).toLocaleDateString('bn-BD') : ''}</div>
            </div>
            <span style={{ fontWeight: 800, color: '#a6f36a', fontSize: '15px' }}>৳{c.spent}</span>
            <a className="btn-ghost" style={{ padding: '8px 12px', fontSize: '12.5px' }} target="_blank" rel="noreferrer" href={'https://wa.me/' + waNum(c.phone)}><Icon name="message" size={14} />Chat</a>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: 'var(--muted)' }}>কাস্টমার নেই</p>}
      </div>
    </div>
  );
}

function InsightsTab({ data }) {
  const searchLog = data.searchLog || [];

  const orders = data.orders || [];
  const today = new Date().toISOString().slice(0, 10);
  const completed = orders.filter((o) => o.status === 'completed');
  const revenue = completed.reduce((a, o) => a + (Number(o.price) || 0), 0);
  const cards = [
    ['মোট অর্ডার', orders.length, 'package'],
    ['আজকের অর্ডার', orders.filter((o) => String(o.created_at || '').startsWith(today)).length, 'clock'],
    ['পেন্ডিং', orders.filter((o) => o.status === 'pending').length, 'alert'],
    ['মোট আয় (সম্পন্ন)', '৳' + revenue, 'chart'],
    ['সম্পন্ন অর্ডার', completed.length, 'check'],
    ['গড় অর্ডার মূল্য', completed.length ? '৳' + Math.round(revenue / completed.length) : '৳0', 'tag'],
    ['রেফারেল অর্ডার', data.referralCount || 0, 'users'],
  ];
  const byProduct = {};
  for (const o of completed) byProduct[o.service_name] = (byProduct[o.service_name] || 0) + 1;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const sum = completed.filter((o) => String(o.created_at || '').startsWith(key)).reduce((a, o) => a + (Number(o.price) || 0), 0);
    days.push({ label: d.toLocaleDateString('bn-BD', { weekday: 'narrow' }), sum });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.sum));
  const top = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div style={{ marginTop: '14px' }}>
      <div className="steps">
        {cards.map(([label, val, icon]) => (
          <div key={label} className="glass" style={{ padding: '19px' }}>
            <span style={{ color: 'var(--accent)' }}><Icon name={icon} size={20} /></span>
            <div style={{ fontWeight: 800, fontSize: '23px', marginTop: '9px', fontFamily: "'Manrope',sans-serif" }}>{val}</div>
            <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '3px' }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '15px', maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '13px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontWeight: 800, fontSize: '15px' }}>গত ৭ দিনের আয় (সম্পন্ন)</span>
          {(() => {
            const todaySum = days[6] ? days[6].sum : 0;
            const yestSum = days[5] ? days[5].sum : 0;
            if (!yestSum && !todaySum) return null;
            const pct = yestSum ? Math.round(((todaySum - yestSum) / yestSum) * 100) : 100;
            const up = pct >= 0;
            return <span style={{ fontSize: '12px', fontWeight: 800, color: up ? '#a6f36a' : '#fca5a5', background: up ? 'rgba(166,243,106,0.1)' : 'rgba(239,68,68,0.1)', border: '1px solid ' + (up ? 'rgba(166,243,106,0.4)' : 'rgba(239,68,68,0.4)'), padding: '3px 9px', borderRadius: '999px' }}>আজ {up ? '▲' : '▼'} {Math.abs(pct)}% (গতকালের তুলনায়)</span>;
          })()}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', height: '110px' }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>{d.sum ? '৳' + d.sum : ''}</span>
              <div style={{ width: '100%', maxWidth: '34px', height: Math.max(4, Math.round((d.sum / maxDay) * 74)) + 'px', borderRadius: '7px 7px 3px 3px', background: 'linear-gradient(180deg,#b8f77e,#8fdd4e)' }} />
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '15px', maxWidth: '520px', display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
        {(() => {
          const total = Math.max(1, orders.length);
          const seg = [['pending', '#fbbf24'], ['processing', '#38bdf8'], ['completed', '#a6f36a'], ['cancelled', '#ef4444']];
          let acc = 0;
          const parts = seg.map(([st, color]) => {
            const n = orders.filter((o) => o.status === st).length;
            const from = (acc / total) * 360;
            acc += n;
            const to = (acc / total) * 360;
            return `${color} ${from}deg ${to}deg`;
          }).join(', ');
          return (
            <>
              <div style={{ width: '104px', height: '104px', borderRadius: '999px', background: `conic-gradient(${parts})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <div style={{ width: '68px', height: '68px', borderRadius: '999px', background: '#0c1119', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '19px', fontFamily: "'Manrope',sans-serif" }}>{orders.length}</div>
              </div>
              <div style={{ display: 'grid', gap: '7px' }}>
                {seg.map(([st, color]) => (
                  <span key={st} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
                    {ST_LABEL[st]} — {orders.filter((o) => o.status === st).length}
                  </span>
                ))}
              </div>
            </>
          );
        })()}
      </div>
      {searchLog.length > 0 && (
        <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '15px', maxWidth: '520px' }}>
          <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '11px' }}>কাস্টমার খুঁজে পায়নি (missed search)</div>
          {searchLog.map((x) => (
            <div key={x.q} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '5px 0', color: '#cbd5e1' }}>
              <span>{x.q}</span><span style={{ fontWeight: 800, color: '#fca5a5' }}>{x.n} বার</span>
            </div>
          ))}
        </div>
      )}
      {top.length > 0 && (
        <div className="glass" style={{ padding: '18px', marginTop: '16px', borderRadius: '15px', maxWidth: '520px' }}>
          <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '11px' }}>সেরা প্রোডাক্ট (বিক্রি)</div>
          {top.map(([title, n]) => (
            <div key={title} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '5px 0', color: '#cbd5e1' }}>
              <span>{title}</span><span style={{ fontWeight: 800, color: '#a6f36a' }}>{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ data, api, reload, setToken }) {
  const [ann, setAnn] = useState(data.announcement || '');
  const [annEnd, setAnnEnd] = useState(data.announcementEndsAt ? String(data.announcementEndsAt).slice(0, 16) : '');
  const [methods, setMethods] = useState(data.payments ? data.payments.methods : []);
  const [usdt, setUsdt] = useState(data.payments ? data.payments.usdtAddress : '');
  const [rate, setRate] = useState(data.payments ? data.payments.usdtRate : 120);
  const [newPin, setNewPin] = useState('');
  const [storeWa, setStoreWa] = useState(data.storeWhatsapp || '8801319760720');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    setAnn(data.announcement || '');
    if (data.payments) { setMethods(data.payments.methods); setUsdt(data.payments.usdtAddress); setRate(data.payments.usdtRate); }
  }, [data]);

  return (
    <div style={{ marginTop: '14px', display: 'grid', gap: '16px', maxWidth: '620px' }}>
      <div className="glass" style={{ padding: '18px', borderRadius: '15px' }}>
        <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '11px' }}>ঘোষণা ব্যানার (Announcement)</div>
        <input className="inp" value={ann} onChange={(e) => setAnn(e.target.value)} placeholder="যেমন: ঈদ অফার — সব সার্ভিসে ছাড়!" />
        <div style={{ display: 'flex', gap: '9px', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 700 }}>অফার শেষ (countdown):</span>
          <input className="inp" type="datetime-local" value={annEnd} onChange={(e) => setAnnEnd(e.target.value)} style={{ width: '220px' }} />
        </div>
        <button className="btn-ghost" style={{ padding: '9px 15px', fontSize: '13px', marginTop: '11px' }} onClick={async () => { const d = await api('save-announcement', { text: ann, endsAt: annEnd || null }); setMsg(d && d.ok ? 'সেভ হয়েছে' : 'হয়নি'); reload(); }}>সেভ করুন</button>
      </div>

      <div className="glass" style={{ padding: '18px', borderRadius: '15px' }}>
        <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '11px' }}>পেমেন্ট নম্বর</div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {methods.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', gap: '9px', alignItems: 'center' }}>
              <span style={{ width: '62px', fontWeight: 700, fontSize: '13.5px' }}>{m.label}</span>
              <input className="inp" value={m.number} onChange={(e) => setMethods((prev) => prev.map((x, j) => j === i ? { ...x, number: e.target.value } : x))} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '9px', alignItems: 'center' }}>
            <span style={{ width: '62px', fontWeight: 700, fontSize: '13.5px' }}>USDT</span>
            <input className="inp" value={usdt} onChange={(e) => setUsdt(e.target.value)} style={{ flex: 2 }} />
            <input className="inp" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ width: '86px' }} title="Rate ৳/$" />
          </div>
        </div>
        <button className="btn-ghost" style={{ padding: '9px 15px', fontSize: '13px', marginTop: '11px' }} onClick={async () => { const d = await api('save-payments', { methods, usdtAddress: usdt, usdtRate: rate }); setMsg(d && d.ok ? 'সেভ হয়েছে' : 'হয়নি'); reload(); }}>সেভ করুন</button>
      </div>

      <div className="glass" style={{ padding: '18px', borderRadius: '15px' }}>
        <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '11px' }}>দোকানের WhatsApp নম্বর</div>
        <div style={{ display: 'flex', gap: '9px' }}>
          <input className="inp" value={storeWa} onChange={(e) => setStoreWa(e.target.value)} placeholder="8801XXXXXXXXX" style={{ flex: 1 }} />
          <button className="btn-ghost" style={{ padding: '9px 15px', fontSize: '13px' }} onClick={async () => { const d = await api('save-store', { whatsapp: storeWa }); setMsg(d && d.ok ? 'সেভ হয়েছে' : 'হয়নি'); }}>সেভ করুন</button>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '8px' }}>সব WhatsApp বাটন/লিংকে এই নম্বরটাই যাবে।</p>
      </div>

      <div className="glass" style={{ padding: '18px', borderRadius: '15px' }}>
        <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '11px' }}>Admin PIN পরিবর্তন</div>
        <div style={{ display: 'flex', gap: '9px' }}>
          <input className="inp" type="password" placeholder="নতুন PIN (কমপক্ষে 4 সংখ্যা)" value={newPin} onChange={(e) => setNewPin(e.target.value)} style={{ flex: 1 }} />
          <button className="btn-ghost" style={{ padding: '9px 15px', fontSize: '13px' }} onClick={async () => {
            const d = await api('change-pin', { pin: newPin });
            if (d && d.ok) { setToken(d.token); try { sessionStorage.setItem('tbcx_admin_token', d.token); } catch {} setMsg('PIN change হয়েছে'); }
            else setMsg('PIN change হয়নি');
          }}>Change</button>
        </div>
      </div>
      {msg && <p style={{ color: '#a6f36a', fontSize: '13px', fontWeight: 700 }}>{msg}</p>}
    </div>
  );
}
