'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, X, MessageCircle, FileText, CreditCard, Receipt } from 'lucide-react'

interface ChecklistItem {
  id: string
  label: string
  description: string
  done: boolean
  icon: React.ReactNode
}

interface OnboardingChecklistProps {
  hasPO: boolean
  hasApproved: boolean
  hasPaid: boolean
}

export default function OnboardingChecklist({ hasPO, hasApproved, hasPaid }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false)

  const items: ChecklistItem[] = [
    {
      id: 'login',
      label: 'เข้าสู่ระบบสำเร็จ',
      description: 'เข้าระบบด้วย Google Account เรียบร้อย',
      done: true, // Always true if they see this
      icon: <CheckCircle2 size={18} />,
    },
    {
      id: 'first_po',
      label: 'ส่งใบเสนอราคาแรก',
      description: 'ส่งรูปใบเสนอราคาผ่าน LINE OA',
      done: hasPO,
      icon: <FileText size={18} />,
    },
    {
      id: 'approve',
      label: 'อนุมัติ PO แรก',
      description: 'ตรวจสอบและอนุมัติ PO ผ่าน LINE',
      done: hasApproved,
      icon: <CreditCard size={18} />,
    },
    {
      id: 'paid',
      label: 'จ่ายเงินและปิด PO',
      description: 'โอนเงิน + ส่งสลิป + รับใบเสร็จ',
      done: hasPaid,
      icon: <Receipt size={18} />,
    },
  ]

  const completed = items.filter(i => i.done).length
  const allDone = completed === items.length
  const progress = (completed / items.length) * 100

  // Hide if all done or dismissed
  if (allDone || dismissed) return null

  return (
    <div className="card p-5 border-ao-green/20 bg-gradient-to-r from-white to-emerald-50/30">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle size={18} className="text-ao-green" />
            เริ่มต้นใช้งาน
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            ทำตามขั้นตอนเหล่านี้เพื่อเริ่มใช้ระบบจัดซื้อ
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ao-green to-ao-green-light rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500">{completed}/{items.length}</span>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
              item.done ? 'bg-emerald-50/50' : 'hover:bg-gray-50'
            }`}
          >
            <div className={item.done ? 'text-ao-green' : 'text-gray-300'}>
              {item.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {item.label}
              </p>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
