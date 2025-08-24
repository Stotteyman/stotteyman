import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div>Gary Lee McCullouch Jr.</div>
        <div style={{ fontSize: 60 }}>Startup Genius & Visionary Investor</div>
      </div>
    ),
    size,
  )
}

