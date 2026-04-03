// ==========================================
// AO Procurement Web App — Type Definitions
// ==========================================

export type UserRole = 'owner' | 'procurement' | 'manager' | 'viewer'

export interface UserProfile {
  id: string
  email: string
  display_name: string
  role: UserRole
  allowed_projects: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  budget: number
  status: 'active' | 'completed'
  line_group_id: string | null
  created_at: string
}

export interface POItem {
  name: string
  qty: number
  unit: string
  unit_price: number
  amount: number
  cost_code: string
}

export type POStatus =
  | 'pending_cc'
  | 'cc_confirmed'
  | 'awaiting_compare'
  | 'selected'
  | 'approved'
  | 'awaiting_transfer'
  | 'awaiting_receipt'
  | 'pending_credit'
  | 'approved_credit'
  | 'paid'
  | 'cancelled'

export interface TempQuotation {
  id: string
  user_id: string
  project_id: string
  shop_name: string
  shop_phone: string
  doc_number: string
  items: POItem[]
  grand_total: number
  ocr_text: string
  status: POStatus
  created_at: string
  updated_at: string
  reason: string
  compare_group: string | null
  split_group: string | null
  parent_id: string | null
  payment_method: string
  expires_at: string | null
}

export interface AuditLog {
  id: number
  po_id: string
  project_id: string
  user_id: string
  action: string
  old_status: string | null
  new_status: string | null
  details: Record<string, any>
  source: string
  created_at: string
}

// Status display helpers
export const STATUS_LABELS: Record<POStatus, string> = {
  pending_cc: 'รอยืนยัน CC',
  cc_confirmed: 'ยืนยัน CC แล้ว',
  awaiting_compare: 'รอเทียบราคา',
  selected: 'เลือกแล้ว',
  approved: 'อนุมัติ',
  awaiting_transfer: 'รอโอนเงิน',
  awaiting_receipt: 'รอใบเสร็จ',
  pending_credit: 'รอเครดิต',
  approved_credit: 'อนุมัติเครดิต',
  paid: 'จ่ายแล้ว',
  cancelled: 'ยกเลิก',
}

export const STATUS_COLORS: Record<POStatus, string> = {
  pending_cc: 'bg-yellow-100 text-yellow-800',
  cc_confirmed: 'bg-blue-100 text-blue-800',
  awaiting_compare: 'bg-purple-100 text-purple-800',
  selected: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-emerald-100 text-emerald-800',
  awaiting_transfer: 'bg-orange-100 text-orange-800',
  awaiting_receipt: 'bg-amber-100 text-amber-800',
  pending_credit: 'bg-cyan-100 text-cyan-800',
  approved_credit: 'bg-teal-100 text-teal-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'เงินสดย่อย',
  transfer: 'โอนเงิน',
  credit: 'เครดิต',
  '': '-',
}
