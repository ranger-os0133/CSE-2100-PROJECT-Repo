import React from 'react';

export function BrandMark({ compact = false, align = 'left' }) {
  const isCentered = align === 'center';
  const size = compact ? 36 : 52;
  const eyeWidth = compact ? 6 : 8;
  const eyeHeight = compact ? 8 : 12;
  const eyeTop = compact ? 15 : 20;
  const modeClass = compact ? 'brand-mark--compact' : 'brand-mark--full';

  return (
    <div
      className={`brand-mark ${modeClass}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: isCentered ? 'center' : 'flex-start',
        gap: compact ? 10 : 14,
      }}
    >
      <div
        aria-hidden="true"
        className="brand-mark__symbol"
        style={{
          width: size,
          height: size,
          borderRadius: compact ? 12 : 18,
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          background: 'radial-gradient(circle at 35% 22%, #173447 0%, #08121d 48%, #020409 100%)',
          boxShadow: '0 18px 42px rgba(2, 6, 14, 0.42)',
          border: '1px solid rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          className="brand-mark__flame brand-mark__flame--left"
          style={{
            position: 'absolute',
            top: compact ? -4 : -6,
            left: compact ? 6 : 8,
            width: compact ? 8 : 12,
            height: compact ? 14 : 20,
            background: 'linear-gradient(180deg, rgba(143, 244, 255, 0.85), rgba(59, 184, 255, 0.12))',
            borderRadius: '80% 20% 70% 30% / 70% 30% 80% 20%',
            filter: 'blur(1.2px)',
            opacity: 0.75,
            transform: 'rotate(-12deg)',
          }}
        />

        <div
          className="brand-mark__flame brand-mark__flame--right"
          style={{
            position: 'absolute',
            top: compact ? -6 : -8,
            right: compact ? 7 : 10,
            width: compact ? 9 : 13,
            height: compact ? 16 : 22,
            background: 'linear-gradient(180deg, rgba(143, 244, 255, 0.92), rgba(47, 160, 255, 0.1))',
            borderRadius: '30% 70% 20% 80% / 20% 80% 30% 70%',
            filter: 'blur(1.3px)',
            opacity: 0.78,
            transform: 'rotate(16deg)',
          }}
        />

        <div
          className="brand-mark__flame brand-mark__flame--center"
          style={{
            position: 'absolute',
            top: compact ? 1 : 2,
            left: compact ? 13 : 18,
            width: compact ? 10 : 15,
            height: compact ? 10 : 14,
            background: 'radial-gradient(circle at 50% 20%, rgba(182, 251, 255, 0.72), rgba(50, 170, 255, 0.08) 72%)',
            borderRadius: '50% 50% 70% 70%',
            filter: 'blur(1.4px)',
            opacity: 0.7,
          }}
        />

        <div
          className="brand-mark__glow"
          style={{
            position: 'absolute',
            inset: compact ? 3 : 4,
            borderRadius: compact ? 10 : 15,
            background: 'radial-gradient(circle at 50% 10%, rgba(120, 238, 255, 0.16), transparent 44%)',
          }}
        />
        <div
          className="brand-mark__frame"
          style={{
            position: 'absolute',
            inset: compact ? 6 : 8,
            borderRadius: compact ? 10 : 14,
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        />

        <div
          className="brand-mark__ghost"
          style={{
            position: 'absolute',
            inset: compact ? 5 : 7,
            borderRadius: compact ? 12 : 18,
            background: 'radial-gradient(circle at 50% 24%, rgba(19, 37, 52, 0.94), rgba(3, 7, 14, 0.98) 70%)',
            clipPath: 'path("M32 8 C42 9 50 16 51 27 C52 36 48 44 40 49 C37 51 36 56 32 56 C28 56 27 51 24 49 C16 44 12 36 13 27 C14 16 22 9 32 8 Z")',
          }}
        />

        <div
          className="brand-mark__brow"
          style={{
            position: 'absolute',
            top: compact ? 10 : 12,
            left: compact ? 10 : 13,
            width: compact ? 16 : 24,
            height: compact ? 8 : 12,
            borderTop: '2px solid rgba(119, 239, 255, 0.26)',
            borderRadius: '999px',
            transform: 'rotate(-10deg)',
            filter: 'blur(0.2px)',
          }}
        />

        <div
          className="brand-mark__eye brand-mark__eye--left"
          style={{
            position: 'absolute',
            top: eyeTop,
            left: compact ? 10 : 14,
            width: eyeWidth,
            height: eyeHeight,
            borderRadius: '999px 999px 70% 70%',
            background: 'linear-gradient(180deg, #b6fbff 0%, #58e6f7 100%)',
            boxShadow: '0 0 10px rgba(110, 241, 255, 0.46)',
            transform: 'rotate(10deg)',
          }}
        />

        <div
          className="brand-mark__eye brand-mark__eye--right"
          style={{
            position: 'absolute',
            top: eyeTop,
            right: compact ? 10 : 14,
            width: eyeWidth,
            height: eyeHeight,
            borderRadius: '999px 999px 70% 70%',
            background: 'linear-gradient(180deg, #b6fbff 0%, #58e6f7 100%)',
            boxShadow: '0 0 10px rgba(110, 241, 255, 0.46)',
            transform: 'rotate(-10deg)',
          }}
        />

        <div
          className="brand-mark__mouth"
          style={{
            position: 'absolute',
            bottom: compact ? 10 : 13,
            width: compact ? 14 : 18,
            height: compact ? 5 : 7,
            borderBottom: '2px solid rgba(124, 220, 255, 0.22)',
            borderRadius: '0 0 999px 999px',
            opacity: 0.9,
          }}
        />

        <div
          className="brand-mark__mist"
          style={{
            position: 'absolute',
            bottom: compact ? -3 : -4,
            left: compact ? 9 : 12,
            width: compact ? 18 : 24,
            height: compact ? 10 : 14,
            background: 'radial-gradient(circle at 50% 30%, rgba(128, 232, 255, 0.35), rgba(44, 126, 255, 0.02) 72%)',
            filter: 'blur(2px)',
            opacity: 0.7,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCentered ? 'center' : 'flex-start' }}>
        <div
          style={{
            color: '#F8FAFC',
            fontSize: compact ? 17 : 28,
            fontWeight: 800,
            letterSpacing: compact ? '-0.04em' : '-0.06em',
            lineHeight: 1,
          }}
        >
          ShadowRealm
        </div>
        {!compact && (
          <div
            style={{
              marginTop: 6,
              color: '#94A3B8',
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Real Posts Real People
          </div>
        )}
      </div>
    </div>
  );
}