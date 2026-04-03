'use client'

import { useState, useEffect } from 'react'
import { Store, Plus, Pencil, Search, CreditCard, Phone, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui'
import { Tooltip, TooltipProvider } from '@/components/ui'

interface Vendor {
  id: string
  name: string
  phone: string
  bank_name: string
  account_number: string
  account_name: string
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const BANKS = [
  'กสิกรไทย', 'กรุงเทพ', 'ไทยพาณิชย์', 'กรุงไทย', 'กรุงศรีอยุธยา',
  'ทหารไทยธนชาต', 'ออมสิน', 'อาคารสงเคราะห์', 'เพื่อการเกษตรและสหกรณ์',
  'ซีไอเอ็มบีไทย', 'ยูโอบี', 'แลนด์แอนด์เฮาส์', 'ทิสโก้', 'เกียรตินาคินภัทร',
]

function BankBadge({ bank }: { bank: string }) {
  if (!bank) return <span className="text-gray-300 text-xs">ยังไม่มีข้อมูล</span>
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ao-navy/10 text-ao-navy text-xs font-medium">
      <CreditCard size={11} />
      {bank}
    </span>
  )
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', bank_name: '', account_number: '', account_name: '', notes: '' })
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('vendors').select('*').order('name')
    if (data) setVendors(data as Vendor[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = vendors.filter(v => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return v.name.toLowerCase().includes(q) ||
      v.phone?.includes(q) ||
      v.account_number?.includes(q)
  })

  function openEdit(v: Vendor) {
    setEditVendor(v)
    setForm({ name: v.name, phone: v.phone, bank_name: v.bank_name, account_number: v.account_number, account_name: v.account_name, notes: v.notes })
  }

  function openAdd() {
    setForm({ name: '', phone: '', bank_name: '', account_number: '', account_name: '', notes: '' })
    setAddOpen(true)
  }

  async function handleSave(mode: 'add' | 'edit') {
    if (!form.name.trim()) return
    setSaving(true)
    if (mode === 'edit' && editVendor) {
      await supabase.from('vendors').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editVendor.id)
      setEditVendor(null)
    } else {
      await supabase.from('vendors').insert([form])
      setAddOpen(false)
    }
    await load()
    setSaving(false)
  }

  async function toggleActive(v: Vendor) {
    await supabase.from('vendors').update({ is_active: !v.is_active }).eq('id', v.id)
    setVendors(prev => prev.map(x => x.id === v.id ? { ...x, is_active: !x.is_active } : x))
  }

  const hasBank = (v: Vendor) => !!(v.bank_name && v.account_number)

  if (loading) {
    return <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}</div>
  }

  const FormFields = ({ mode }: { mode: 'add' | 'edit' }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อร้านค้า <span className="text-red-500">*</span></label>
          <input className="input-field" placeholder="เช่น ร้านสหไทย, บริษัท ABC" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={mode === 'edit'} />
          {mode === 'edit' && <p className="text-xs text-gray-400 mt-1">ชื่อร้านค้าไม่สามารถเปลี่ยนได้ (ใช้เป็น key ใน LINE)</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">เบอร์โทร</label>
          <input className="input-field" placeholder="0812345678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ธนาคาร</label>
          <select className="input-field" value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}>
            <option value="">— เลือกธนาคาร —</option>
            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">เลขบัญชี</label>
          <input className="input-field font-mono" placeholder="xxx-x-xxxxx-x" value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อบัญชี</label>
          <input className="input-field" placeholder="ชื่อ นามสกุล หรือชื่อบริษัท" value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">หมายเหตุ</label>
          <input className="input-field" placeholder="เช่น ติดต่อคุณสมชาย เฉพาะวันจันทร์-ศุกร์" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <DialogClose asChild>
          <button className="btn-secondary flex-1" disabled={saving}>ยกเลิก</button>
        </DialogClose>
        <button
          onClick={() => handleSave(mode)}
          disabled={saving || !form.name.trim()}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ทะเบียนร้านค้า</h1>
            <p className="text-sm text-gray-400 mt-0.5">{vendors.length} ร้านค้า · {vendors.filter(hasBank).length} มีบัญชีธนาคาร</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={16} /> เพิ่มร้านค้า
              </button>
            </DialogTrigger>
            <DialogContent title="เพิ่มร้านค้าใหม่" description="กรอกข้อมูลร้านค้าและบัญชีธนาคารสำหรับโอนเงิน">
              <FormFields mode="add" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อร้าน, เบอร์โทร, เลขบัญชี..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ao-navy/10 flex items-center justify-center">
              <Store size={18} className="text-ao-navy" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vendors.filter(v => v.is_active).length}</p>
              <p className="text-xs text-gray-400">ร้านค้า Active</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ao-green/10 flex items-center justify-center">
              <CreditCard size={18} className="text-ao-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vendors.filter(hasBank).length}</p>
              <p className="text-xs text-gray-400">มีบัญชีธนาคาร</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <XCircle size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vendors.filter(v => !hasBank(v)).length}</p>
              <p className="text-xs text-gray-400">ยังไม่มีบัญชี</p>
            </div>
          </div>
        </div>

        {/* Vendor List */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ร้านค้า</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">เบอร์โทร</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ธนาคาร</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">เลขบัญชี</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ชื่อบัญชี</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className={`border-b border-gray-50 hover:bg-ao-green/5 transition-colors ${!v.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-ao-navy/10 flex items-center justify-center flex-shrink-0">
                        <Store size={14} className="text-ao-navy" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{v.name}</p>
                        {v.notes && <p className="text-xs text-gray-400 truncate max-w-[180px]">{v.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {v.phone
                      ? <span className="flex items-center gap-1 text-gray-600 text-xs"><Phone size={11} />{v.phone}</span>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="py-3 px-4"><BankBadge bank={v.bank_name} /></td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-700">{v.account_number || <span className="text-gray-300">—</span>}</td>
                  <td className="py-3 px-4 text-gray-700 text-xs">{v.account_name || <span className="text-gray-300">—</span>}</td>
                  <td className="py-3 px-4 text-center">
                    <Tooltip content={v.is_active ? 'คลิกเพื่อ Disable' : 'คลิกเพื่อ Enable'}>
                      <button onClick={() => toggleActive(v)}>
                        {v.is_active
                          ? <CheckCircle size={18} className="text-ao-green mx-auto" />
                          : <XCircle size={18} className="text-gray-300 mx-auto" />
                        }
                      </button>
                    </Tooltip>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Dialog open={editVendor?.id === v.id} onOpenChange={open => !open && setEditVendor(null)}>
                      <DialogTrigger asChild>
                        <button onClick={() => openEdit(v)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-ao-navy hover:bg-gray-100 transition-colors">
                          <Pencil size={14} />
                        </button>
                      </DialogTrigger>
                      <DialogContent title={`แก้ไข: ${v.name}`} description="อัปเดตข้อมูลบัญชีธนาคารสำหรับโอนเงิน">
                        <FormFields mode="edit" />
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Store size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">ยังไม่มีร้านค้าในระบบ</p>
                    <p className="text-gray-400 text-sm mt-1">ร้านค้าจะถูกเพิ่มอัตโนมัติเมื่อมีการบันทึกบัญชีธนาคารผ่าน LINE</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  )
}
