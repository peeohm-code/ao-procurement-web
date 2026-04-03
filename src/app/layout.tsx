import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AO Procurement | ระบบจัดซื้อ',
  description: 'AO Construction & Engineering — ระบบจัดซื้อวัสดุก่อสร้าง',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
