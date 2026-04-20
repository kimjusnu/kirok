import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#18181b',
          color: '#ffffff',
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: '-0.05em',
          fontFamily: 'serif',
        }}
      >
        k
      </div>
    ),
    size,
  )
}
