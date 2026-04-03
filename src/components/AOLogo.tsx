'use client'

import { useId } from 'react'

export default function AOLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const uid = useId().replace(/:/g, '_')

  const sizes = {
    sm: { iconW: 44, iconH: 44, textPrimary: '8.5px', textSecondary: '6.5px', gap: 7 },
    md: { iconW: 58, iconH: 58, textPrimary: '11px',   textSecondary: '8px',   gap: 9 },
    lg: { iconW: 78, iconH: 78, textPrimary: '14px',   textSecondary: '10px',  gap: 12 },
  }
  const s = sizes[size]

  // viewBox: 0 0 86 86  (nearly square — A tall+narrow, O circle ≈ A width)
  // A occupies x=0..40, y=0..82
  // O circle: cx=60 cy=50 r=22  (left edge=38, overlaps A by 2px)
  const cX = 60, cY = 50, cR = 22
  const numStripes = 12
  const stripeW = (cR * 2) / numStripes

  return (
    <div className="flex items-center" style={{ gap: s.gap }}>
      <svg
        width={s.iconW}
        height={s.iconH}
        viewBox="0 0 86 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient on A: deep navy at bottom → teal at top */}
          <linearGradient
            id={`ag${uid}`}
            x1="0" y1="82" x2="32" y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#00366D" />
            <stop offset="55%"  stopColor="#005A78" />
            <stop offset="100%" stopColor="#009E90" />
          </linearGradient>

          {/* Clip stripes to O circle */}
          <clipPath id={`oc${uid}`}>
            <circle cx={cX} cy={cY} r={cR} />
          </clipPath>
        </defs>

        {/*
          A shape — letter A / building silhouette
          Outer: (0,82)→(0,22)→peak(20,2)→(40,18)→(40,82)
          Inner counter (open space): (29,82)→(29,50)→(11,50)→(11,82)
        */}
        <path
          d="M 0,82 L 0,22 L 20,2 L 40,18 L 40,82 L 29,82 L 29,50 L 11,50 L 11,82 Z"
          fill={`url(#ag${uid})`}
        />

        {/* O — base fill (dark green behind stripes) */}
        <circle cx={cX} cy={cY} r={cR} fill="#009B60" />

        {/* O — vertical stripes clipped to circle */}
        <g clipPath={`url(#oc${uid})`}>
          {Array.from({ length: numStripes }, (_, i) => (
            <rect
              key={i}
              x={cX - cR + i * stripeW}
              y={cY - cR}
              width={stripeW}
              height={cR * 2}
              fill={i % 2 === 0 ? '#00CE81' : '#009B60'}
            />
          ))}
        </g>
      </svg>

      <div className="flex flex-col leading-none">
        <span
          style={{
            fontSize: s.textPrimary,
            fontWeight: 700,
            color: '#00366D',
            letterSpacing: '0.08em',
            lineHeight: 1.25,
          }}
        >
          CONSTRUCTION
        </span>
        <span
          style={{
            fontSize: s.textSecondary,
            fontWeight: 400,
            color: '#9CA3AF',
            letterSpacing: '0.06em',
            lineHeight: 1.25,
          }}
        >
          AND ENGINEERING
        </span>
      </div>
    </div>
  )
}
