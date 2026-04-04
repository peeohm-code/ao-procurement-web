'use client'

// ─── LIFF Banner ────────────────────────────────────────────────
// แสดงเมื่อเปิดจาก LINE in-app browser:
//   - ไม่มี sidebar (ซ่อนอยู่) → แสดง LINE user display name บน top bar
//   - มีปุ่ม "ปิด" กลับไปหน้า LINE chat
// ────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { getLiffProfile, closeLiff, isInLineApp, LiffProfile } from '@/lib/liff'

export default function LiffBanner() {
  const [profile, setProfile] = useState<LiffProfile | null>(null)
  const [inLine, setInLine] = useState(false)

  useEffect(() => {
    async function check() {
      const inApp = await isInLineApp()
      setInLine(inApp)
      if (inApp) {
        const p = await getLiffProfile()
        setProfile(p)
      }
    }
    check()
  }, [])

  if (!inLine) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-ao-navy text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2.5">
        <MessageCircle size={16} className="text-ao-green flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold leading-tight">
            {profile ? `สวัสดี ${profile.displayName}` : 'AO Procurement'}
          </p>
          <p className="text-[10px] text-white/60 leading-tight">เปิดจาก LINE</p>
        </div>
      </div>
      <button
        onClick={closeLiff}
        className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
      >
        <X size={14} />
        <span>ปิดหน้าต่าง</span>
      </button>
    </div>
  )
}
