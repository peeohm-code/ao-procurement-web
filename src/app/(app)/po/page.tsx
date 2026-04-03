'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Download, ChevronDown, ChevronRight, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDateTime } from '@/lib/format'
import StatusBadge from '@/components/StatusBadge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui'
import { TempQuotation, Project, POStatus, POItem, PAYMENT_LABELS } from '@/lib/types'

export default function POListPage() {
  const [pos, setPOs] = useState<TempQuotation[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<'created_at' | 'grand_total'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: poData }, { data: projData }] = await Promise.all([
        supabase.from('temp_quotations').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('id'),
      ])
      if (poData) setPOs(poData as TempQuotation[])
      if (projData) setProjects(projData as Project[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = [...pos]
    if (filterProject !== 'all') result = result.filter(po => po.project_id === filterProject)
    if (filterStatus !== 'all') result = result.filter(po => po.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(po =>
        po.id.toLowerCase().includes(q) ||
        po.shop_name?.toLowerCase().includes(q) ||
        po.doc_number?.toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      const aVal = sortField === 'grand_total' ? Number(a.grand_total) : new Date(a.created_at).getTime()
      const bVal = sortField === 'grand_total' ? Number(b.grand_total) : new Date(b.created_at).getTime()
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
    return result
  }, [pos, filterProject, filterStatus, search, sortField, sortDir])

  const handleSort = (field: 'created_at' | 'grand_total') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const exportCSV = () => {
    const headers = ['เลขPO', 'โครงการ', 'ร้านค้า', 'เลขเอกสาร', 'ยอดเงิน', 'สถานะ', 'วิธีจ่าย', 'วันที่']
    const rows = filtered.map(po => [po.id, po.project_id, po.shop_name, po.doc_number, po.grand_total, po.status, po.payment_method, po.created_at])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PO-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  if (loading) {
    return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /><div className="h-96 bg-gray-200 rounded-xl" /></div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PO ทั้งหมด</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} รายการ</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา PO, ร้านค้า, เลขเอกสาร..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="input-field w-auto min-w-[160px]">
            <option value="all">ทุกโครงการ</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto min-w-[140px]">
            <option value="all">ทุกสถานะ</option>
            <option value="paid">จ่ายแล้ว</option>
            <option value="approved">อนุมัติ</option>
            <option value="awaiting_transfer">รอโอน</option>
            <option value="awaiting_receipt">รอใบเสร็จ</option>
            <option value="pending_credit">รอเครดิต</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="w-8 py-3 px-3" />
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">เลข PO</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">โครงการ</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ร้านค้า</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">เลขเอกสาร</th>
                <th
                  className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-ao-navy"
                  onClick={() => handleSort('grand_total')}
                >
                  ยอดเงิน {sortField === 'grand_total' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">วิธีจ่าย</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th
                  className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-ao-navy"
                  onClick={() => handleSort('created_at')}
                >
                  วันที่ {sortField === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => {
                const isExpanded = expandedRows.has(po.id)
                const items: POItem[] = Array.isArray(po.items) ? po.items : []
                const hasItems = items.length > 0

                return (
                  <Collapsible key={po.id} open={isExpanded} onOpenChange={() => toggleRow(po.id)} asChild>
                    <>
                      {/* Main Row */}
                      <tr className={`border-b border-gray-50 hover:bg-ao-green/5 transition-colors ${isExpanded ? 'bg-ao-green/5 border-ao-green/20' : ''}`}>
                        <td className="py-3 px-3">
                          <CollapsibleTrigger asChild>
                            <button
                              className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${hasItems ? 'text-gray-400 hover:text-ao-navy hover:bg-gray-100' : 'text-gray-200 cursor-default'}`}
                              disabled={!hasItems}
                            >
                              {isExpanded
                                ? <ChevronDown size={14} />
                                : <ChevronRight size={14} />
                              }
                            </button>
                          </CollapsibleTrigger>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-ao-navy font-medium">{po.id}</td>
                        <td className="py-3 px-4 text-gray-600">{po.project_id}</td>
                        <td className="py-3 px-4 text-gray-900 max-w-[200px] truncate">{po.shop_name}</td>
                        <td className="py-3 px-4 text-gray-500">{po.doc_number || '-'}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(Number(po.grand_total))}</td>
                        <td className="py-3 px-4 text-center text-gray-500 text-xs">
                          {PAYMENT_LABELS[po.payment_method] || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={po.status as POStatus} />
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400 text-xs">
                          {formatDateTime(po.created_at)}
                        </td>
                      </tr>

                      {/* Expanded Items Row */}
                      <CollapsibleContent asChild>
                        <tr className="bg-gray-50/60">
                          <td colSpan={9} className="px-4 pb-3 pt-0">
                            <div className="ml-6 mt-2 rounded-xl border border-gray-100 overflow-hidden">
                              {/* Items header */}
                              <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-gray-100/60 text-xs font-medium text-gray-500 uppercase">
                                <span className="col-span-2">รายการ</span>
                                <span className="text-right">จำนวน</span>
                                <span className="text-right">ราคา/หน่วย</span>
                                <span className="text-right">ยอด</span>
                              </div>
                              {/* Items */}
                              {items.map((item, i) => (
                                <div key={i} className={`grid grid-cols-5 gap-4 px-4 py-2.5 text-sm ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                  <div className="col-span-2 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-ao-navy/10 flex items-center justify-center flex-shrink-0">
                                      <Package size={11} className="text-ao-navy" />
                                    </div>
                                    <div>
                                      <div className="text-gray-900 font-medium text-xs">{item.name}</div>
                                      <div className="text-gray-400 text-xs">CC: {item.cost_code}</div>
                                    </div>
                                  </div>
                                  <div className="text-right text-gray-600 text-xs self-center">
                                    {item.qty} {item.unit}
                                  </div>
                                  <div className="text-right text-gray-600 text-xs self-center">
                                    {formatCurrency(item.unit_price)}
                                  </div>
                                  <div className="text-right font-semibold text-gray-900 text-xs self-center">
                                    {formatCurrency(item.amount)}
                                  </div>
                                </div>
                              ))}
                              {/* Footer total */}
                              <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-ao-navy/5 border-t border-gray-100">
                                <div className="col-span-4 text-right text-xs font-semibold text-gray-500">รวมทั้งหมด</div>
                                <div className="text-right text-sm font-bold text-ao-navy">
                                  {formatCurrency(Number(po.grand_total))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                        <Search size={24} className="text-gray-300" />
                      </div>
                      <p className="text-base font-semibold text-gray-600">ไม่พบ PO ที่ตรงกับเงื่อนไข</p>
                      <p className="text-sm text-gray-400 mt-1">ลองเปลี่ยนตัวกรองหรือคำค้นหาใหม่</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
