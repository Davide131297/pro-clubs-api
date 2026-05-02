import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        {/* Green ring */}
        <div
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            border: '7px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(34,197,94,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '62px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-2px',
                lineHeight: '1',
                display: 'flex',
              }}
            >
              PC
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#22c55e',
                letterSpacing: '4px',
                lineHeight: '1',
                display: 'flex',
              }}
            >
              CLUBS
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
