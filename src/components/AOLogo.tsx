'use client'

export default function AOLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { w: 28, h: 28, text: 'text-xs' },
    md: { w: 36, h: 36, text: 'text-sm' },
    lg: { w: 48, h: 48, text: 'text-base' },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2.5">
      <svg width={s.w} height={s.h} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* A shape - navy */}
        <path d="M4 38V10L16 4V14L10 17V38H4Z" fill="#00366D" />
        <path d="M16 4L22 10V38H16V4Z" fill="#004A8F" />
        {/* O shape - gradient green */}
        <circle cx="34" cy="24" r="13" fill="url(#ao-grad)" />
        {/* Vertical lines in O */}
        <g opacity="0.6">
          {[28, 31, 34, 37, 40].map((x) => (
            <line key={x} x1={x} y1="14" x2={x} y2="34" stroke="white" strokeWidth="1.2" />
          ))}
        </g>
        <defs>
          <linearGradient id="ao-grad" x1="21" y1="24" x2="47" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00366D" />
            <stop offset="1" stopColor="#00CE81" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col leading-tight">
        <span className={`font-bold text-ao-navy ${s.text}`}>CONSTRUCTION</span>
        <span className={`font-normal text-gray-400 ${s.text}`} style={{ fontSize: '0.65em' }}>
          AND ENGINEERING
        </span>
      </div>
    </div>
  )
}
