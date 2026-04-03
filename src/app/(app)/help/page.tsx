'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, MessageCircle, BookOpen, Zap, Shield, LifeBuoy } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui'

interface FAQItem {
  q: string
  a: string
}

interface FAQSection {
  icon: React.ElementType
  title: string
  color: string
  items: FAQItem[]
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    icon: Zap,
    title: 'เริ่มต้นใช้งาน',
    color: 'text-amber-500 bg-amber-50',
    items: [
      { q: 'ระบบนี้ทำงานอย่างไร?', a: 'ระบบจัดซื้อ AO ทำงานผ่าน LINE OA — ส่งรูปใบเสนอราคาหรือ PDF ใน LINE แล้ว AI จะอ่านข้อมูลอัตโนมัติ จัดหมวดหมู่ Cost Code และสร้าง PO ให้พร้อม ส่วน Web App นี้ใช้สำหรับดูภาพรวม, ค้นหา PO ย้อนหลัง และจัดการข้อมูล' },
      { q: 'ใครสามารถเข้าถึงระบบได้บ้าง?', a: 'มี 4 ระดับสิทธิ์: Owner (เต็มสิทธิ์), Procurement (สั่งซื้อ + อนุมัติ), Manager (ดูรายงาน), Viewer (ดูอย่างเดียว) — เจ้าของโปรเจกต์สามารถกำหนดสิทธิ์ผ่านหน้า "จัดการผู้ใช้"' },
      { q: 'จะเพิ่มโครงการใหม่ได้อย่างไร?', a: 'แจ้ง Ohm เพื่อเพิ่มโครงการผ่านระบบ (ต้องมีไฟล์ BOQ และชื่อโครงการ) ระบบจะสร้าง tab ใน Google Sheets, dashboard และตั้งค่าทุกอย่างอัตโนมัติ' },
    ]
  },
  {
    icon: BookOpen,
    title: 'การใช้งาน PO',
    color: 'text-ao-navy bg-ao-navy/10',
    items: [
      { q: 'PO คืออะไร และมีสถานะอะไรบ้าง?', a: 'PO (Purchase Order) คือใบสั่งซื้อที่สร้างจากใบเสนอราคา สถานะหลักได้แก่: รอยืนยัน CC → ยืนยันแล้ว → รอเทียบราคา → อนุมัติ → รอโอน/รอใบเสร็จ/รอเครดิต → จ่ายแล้ว' },
      { q: 'Cost Code คืออะไร?', a: 'Cost Code คือรหัสหมวดหมู่งานก่อสร้าง เช่น 102=คอนกรีต, 104=เหล็กเส้น, 105=เหล็กโครงสร้าง AI จะจัดหมวดหมู่ให้อัตโนมัติ แต่สามารถแก้ไขได้ใน LINE ก่อนยืนยัน' },
      { q: 'จะดูรายละเอียดสินค้าใน PO ได้อย่างไร?', a: 'ในหน้า "PO ทั้งหมด" กดลูกศร ▶ ที่หน้า PO เพื่อ expand ดูรายการสินค้าทุกชิ้นพร้อมราคาและ Cost Code ได้เลย' },
      { q: 'Export ข้อมูล PO ได้ไหม?', a: 'ได้ครับ กดปุ่ม "Export CSV" ในหน้า PO ทั้งหมด จะได้ไฟล์ .csv ที่เปิดได้ใน Excel พร้อม BOM สำหรับภาษาไทย' },
    ]
  },
  {
    icon: MessageCircle,
    title: 'การโอนเงินและบัญชีร้านค้า',
    color: 'text-ao-green bg-ao-green/10',
    items: [
      { q: 'ระบบบันทึกบัญชีธนาคารร้านค้าอย่างไร?', a: 'เมื่อโอนเงินครั้งแรก ให้พิมพ์ในไลน์ในรูปแบบ: "ธนาคาร/เลขบัญชี/ชื่อบัญชี" เช่น "กสิกร/123-4-56789-0/บริษัท ABC" ระบบจะบันทึกไว้อัตโนมัติ ครั้งถัดไปไม่ต้องพิมพ์ใหม่' },
      { q: 'จะแก้ไขหรือเพิ่มบัญชีธนาคารร้านค้าได้ที่ไหน?', a: 'เข้าหน้า "ทะเบียนร้านค้า" ในเมนูซ้ายมือ สามารถดู แก้ไข และเพิ่มร้านค้าใหม่ได้ การแก้ไขจะมีผลทันทีทั้งบน Web App และใน LINE' },
      { q: 'มีวิธีจ่ายเงินกี่แบบ?', a: '3 แบบ: (1) เงินสดย่อย — อนุมัติแล้วส่งใบเสร็จปิด, (2) โอนเงิน — ระบบแสดงบัญชีธนาคาร → โอน → ส่งสลิป → ส่งใบเสร็จ, (3) เครดิตร้านค้า — อนุมัติเครดิต → ส่งใบเสร็จเมื่อครบกำหนด' },
    ]
  },
  {
    icon: Shield,
    title: 'ความปลอดภัยและสิทธิ์',
    color: 'text-purple-500 bg-purple-50',
    items: [
      { q: 'ข้อมูลถูกเก็บที่ไหน?', a: 'ข้อมูล PO และสถานะเก็บใน Supabase (PostgreSQL) ข้อมูล BOQ, ทะเบียน PO รวม และ Dashboard เก็บใน Google Sheets รูปภาพเก็บใน Google Drive ของ Ohm' },
      { q: 'LOGIN ด้วยอะไร?', a: 'ใช้ Google Account เท่านั้น (SSO) ไม่มีรหัสผ่านแยก ต้องเป็น email ที่ได้รับสิทธิ์จาก Owner ก่อน' },
      { q: 'ถ้าไม่มีสิทธิ์เข้าโครงการจะเห็นอะไร?', a: 'Role viewer/manager จะเห็นเฉพาะโครงการที่ได้รับสิทธิ์ใน allowed_projects เท่านั้น Owner และ Procurement เห็นทุกโครงการ' },
    ]
  },
]

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between py-3.5 px-4 text-left hover:bg-gray-50 rounded-xl transition-colors group">
        <span className="text-sm font-medium text-gray-800 pr-4">{item.q}</span>
        {open
          ? <ChevronDown size={16} className="text-ao-green flex-shrink-0" />
          : <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
        }
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{item.a}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-ao-navy flex items-center justify-center">
          <LifeBuoy size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-sm text-gray-400">คำถามที่พบบ่อยและคู่มือการใช้งาน AO Procurement</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FAQ_SECTIONS.map(s => (
          <a key={s.title} href={`#${s.title}`} className="card p-3 flex items-center gap-2.5 hover:border-ao-green/30 hover:shadow-sm transition-all">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={14} />
            </div>
            <span className="text-xs font-medium text-gray-700">{s.title}</span>
          </a>
        ))}
      </div>

      {/* FAQ sections */}
      {FAQ_SECTIONS.map(section => (
        <div key={section.title} id={section.title} className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section.color}`}>
              <section.icon size={16} />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">{section.title}</h2>
          </div>
          <div className="p-2 space-y-0.5">
            {section.items.map((item, i) => (
              <FAQAccordion key={i} item={item} />
            ))}
          </div>
        </div>
      ))}

      {/* Contact */}
      <div className="card p-5 bg-gradient-to-br from-ao-navy/5 to-ao-green/5 border-ao-green/20">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle size={18} className="text-ao-navy" />
          <h3 className="text-sm font-semibold text-gray-800">ยังมีคำถาม?</h3>
        </div>
        <p className="text-sm text-gray-600">ติดต่อ <span className="font-medium text-ao-navy">Ohm</span> ผ่าน LINE หรือ suntaku@gmail.com</p>
      </div>
    </div>
  )
}
