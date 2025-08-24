import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: '#000',
          color: '#fff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>Gary Lee McCullouch Jr.</div>
        <div>Startup Genius & Visionary Investor</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
