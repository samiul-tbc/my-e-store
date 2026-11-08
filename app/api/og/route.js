import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Dynamic social-share image: /api/og?title=...&price=...
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'TBC × E-store').slice(0, 90);
  const price = searchParams.get('price') || '';
  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, #07090d 0%, #0d1420 60%, #131f14 100%)', padding: '56px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '17px', background: 'linear-gradient(135deg, #c9ff8f, #8fe34f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10170c', fontSize: '34px', fontWeight: 900 }}>×</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#eef2f6', fontSize: '27px', fontWeight: 800, letterSpacing: '0.5px' }}>TBC × E-STORE</span>
            <span style={{ color: '#94a3b8', fontSize: '15px', letterSpacing: '3px' }}>PREMIUM E-SERVICES</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <span style={{ color: '#eef2f6', fontSize: '58px', fontWeight: 800, lineHeight: 1.2 }}>{title}</span>
          {price ? <span style={{ color: '#a6f36a', fontSize: '42px', fontWeight: 800 }}>৳{price}</span> : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '19px' }}>Secure payment • Fast digital delivery</span>
          <span style={{ color: '#a6f36a', fontSize: '19px', fontWeight: 700 }}>WhatsApp: 01319-760720</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
