import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'kirok · Big Five, decoded.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fafafa',
          color: '#18181b',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#71717a',
          }}
        >
          IPIP BIG-FIVE · 50 ITEMS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 140,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
              fontFamily: 'serif',
            }}
          >
            Big Five,
          </div>
          <div
            style={{
              fontSize: 140,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
              fontFamily: 'serif',
            }}
          >
            decoded.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              color: '#3f3f46',
              letterSpacing: '-0.01em',
            }}
          >
            10분 · AI 해석 · OpenAlex 논문 인용
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            borderTop: '1px solid #d4d4d8',
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            kirok
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              fontSize: 28,
            }}
          >
            <span style={{ color: '#71717a', textDecoration: 'line-through' }}>
              4,900
            </span>
            <span style={{ fontWeight: 600 }}>1,900원</span>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
