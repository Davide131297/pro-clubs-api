import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
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
        }}
      >
        {/* Green ring */}
        <div
          style={{
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '20px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(34,197,94,0.06)',
          }}
        >
          {/* Inner content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0px',
            }}
          >
            <div
              style={{
                fontSize: '180px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-6px',
                lineHeight: '1',
                display: 'flex',
              }}
            >
              PC
            </div>
            <div
              style={{
                fontSize: '44px',
                fontWeight: 700,
                color: '#22c55e',
                letterSpacing: '10px',
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
