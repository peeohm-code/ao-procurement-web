'use client'

import { useId } from 'react'

export default function AOLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const uid = useId().replace(/:/g, '_')

  // Icon aspect ratio ≈ 1.1 : 1  (viewBox 110×100)
  const sizes = {
    sm: { iconW: 40, iconH: 36, primary: '8px',  secondary: '6px',  gap: 7  },
    md: { iconW: 54, iconH: 49, primary: '11px', secondary: '8px',  gap: 9  },
    lg: { iconW: 76, iconH: 69, primary: '15px', secondary: '11px', gap: 13 },
  }
  const s = sizes[size]

  /*
   * viewBox "0 0 110 100"
   *
   * LEFT A element  — wide block, diagonal top-right edge
   *   (0,0) → (44,47) → (44,100) → (0,100)   [clockwise]
   *
   * GAP between A elements: x = 44 → 53
   *
   * RIGHT A element — narrow rectangle
   *   (53,30) → (63,30) → (63,100) → (53,100)
   *
   * O circle  —  center (83,56) r=26
   *   left edge = 57  →  overlaps right element (53–63) by 6 px
   *   top ≈ 30  (matches right element top)
   *   right edge = 109
   *
   * Render order: left A → right A → O (O sits on top of right A)
   */
  const cX = 83, cY = 56, cR = 26
  const numStripes = 11
  const stripeW = (cR * 2) / numStripes

  return (
    <div className="flex items-center" style={{ gap: s.gap }}>
      <svg
        width={s.iconW}
        height={s.iconH}
        viewBox="0 0 110 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient: navy bottom-left → teal top-right, shared by both A elements */}
          <linearGradient
            id={`ag${uid}`}
            x1="0" y1="100" x2="63" y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#00366D" />
            <stop offset="45%"  stopColor="#005C78" />
            <stop offset="100%" stopColor="#009E88" />
          </linearGradient>

          {/* Clip stripes to O circle */}
          <clipPath id={`oc${uid}`}>
            <circle cx={cX} cy={cY} r={cR} />
          </clipPath>
        </defs>

        {/* ── LEFT A element ── */}
        <path
          d="M 0,100 L 0,0 L 44,47 L 44,100 Z"
          fill={`url(#ag${uid})`}
        />

        {/* ── RIGHT A element ── */}
        <path
          d="M 53,30 L 63,30 L 63,100 L 53,100 Z"
          fill={`url(#ag${uid})`}
        />

        {/* ── O circle: dark-green base ── */}
        <circle cx={cX} cy={cY} r={cR} fill="#007B60" />

        {/* ── O vertical stripes clipped to circle ── */}
        <g clipPath={`url(#oc${uid})`}>
          {Array.from({ length: numStripes }, (_, i) => (
            <rect
              key={i}
              x={cX - cR + i * stripeW}
              y={cY - cR}
              width={stripeW}
              height={cR * 2}
              fill={i % 2 === 0 ? '#00CE81' : '#007B60'}
            />
          ))}
        </g>
      </svg>

      {/* Text: black bold — matches brand reference */}
      <div className="flex flex-col leading-none">
        <span
          style={{
            fontSize: s.primary,
            fontWeight: 800,
            color: '#111111',
            letterSpacing: '0.07em',
            lineHeight: 1.3,
          }}
        >
          CONSTRUCTION
        </span>
        <span
          style={{
            fontSize: s.secondary,
            fontWeight: 400,
            color: '#444444',
            letterSpacing: '0.05em',
            lineHeight: 1.3,
          }}
        >
          AND ENGINEERING
        </span>
      </div>
    </div>
  )
}
