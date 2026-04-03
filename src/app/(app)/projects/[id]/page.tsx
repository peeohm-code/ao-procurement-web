'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { ArrowLeft, TrendingUp, Wallet, ClipboardList, CheckCircle2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatDateTime } from '@/lib/format'
import StatusBadge from '@/components/StatusBadge'
import { Project, TempQuotation, POItem, POStatus, PAYMENT_LABELS } from '@/lib/types'

const CC_LABELS: Record<string, string> = {
  '101': 'เตรียมสถานที่', '102': 'คอนกรีต/ปูน', '103': 'งานดิน',
  '104': 'เหล็กเส้น', '105': 'เหล็กโครงสร้าง', '106': 'งานไม้',
  '107': 'งานก่ออิฐ', '108': 'งานฉาบ', '109': 'งานประปา',
  '110': 'งานไฟฟ้า', '111': 'งานหลังคา', '112': 'งานพื้น/กระเบื้อง',
  '113': 'งานประตู/หน้าต่าง', '114': 'งานสี', '115': 'อื่นๆ',
}

const STATUS_PIE_COLORS: Record<string, string> = {
  paid: '#00CE81',
  approved: '#00366D',
  awaiting_transfer: '#f97316',
  awaiting_receipt: '#f59e0b',
  pending_credit: '#06b6d4',
  cancelled: '#e5e7eb',
  other: '#94a3b8',
}

const MONTH_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [pos, setPOs] = useState<TempQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: proj }, { data: poData }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('temp_quotations').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      ])
      if (proj) setProject(proj as Project)
      if (poData) setPOs(poData as TempQuotation[])
      setLoading(false)
    }
    load()
  }, [projectId])

  // Stats
  const stats = useMemo(() => {
    const paid = pos.filter(p => p.status === 'paid')
    const active = pos.filter(p => !['paid', 'cancelled'].includes(p.status))
    const cancelled = pos.filter(p => p.status === 'cancelled')
    const spent = paid.reduce((s, p) => s + Number(p.grand_total), 0)
    const pending = active.reduce((s, p) => s + Number(p.grand_total), 0)
    const budget = Number(project?.budget || 0)
    return { paid, active, cancelled, spent, pending, budget, percent: budget > 0 ? (spent / budget) * 100 : 0 }
  }, [pos, project])

  // Spending by Cost Code (from items JSONB)
  const ccData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const po of pos.filter(p => p.status === 'paid')) {
      const items: POItem[] = Array.isArray(po.items) ? po.items : []
      for (const item of items) {
        const cc = item.cost_code || 'other'
        map[cc] = (map[cc] || 0) + Number(item.amount)
      }
    }
    return Object.entries(map)
      .map(([cc, amount]) => ({ cc, label: CC_LABELS[cc] || `CC${cc}`, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
  }, [pos])

  // Monthly spending (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date()
    const months: { key: string; label: string; amount: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: MONTH_TH[d.getMonth()], amount: 0 })
    }
    for (const po of pos.filter(p => p.status === 'paid')) {
      const mo = po.created_at?.slice(0, 7)
      const m = months.find(x => x.key === mo)
      if (m) m.amount += Number(po.grand_total)
    }
    return months
  }, [pos])

  // Status pie
  const pieData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const po of pos.filter(p => p.status !== 'cancelled')) {
      const key = ['paid','approved','awaiting_transfer','awaiting_receipt','pending_credit'].includes(po.status) ? po.status : 'other'
      map[key] = (map[key] || 0) + 1
    }
    return Object.entries(map).map(([name, value]) => ({
      name: { paid:'จ่ายแล้ว', approved:'อนุมัติ', awaiting_transfer:'รอโอน', awaiting_receipt:'รอใบเสร็จ', pending_credit:'รอเครดิต', other:'อื่นๆ' }[name] || name,
      value, key: name,
    }))
  }, [pos])

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 rounded w-48" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div>
      <div className="grid grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl" />)}</div>
    </div>
  )

  if (!project) return (
    <div className="text-center py-24 text-gray-400">ไม่พบโครงการ</div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ao-navy text-white flex items-center justify-center font-bold text-sm">
            {project.id.replace('P','')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-400">{project.id} &middot; {project.status === 'active' ? '🟢 กำลังดำเนินการ' : '⚫ เสร็จสิ้น'}</p>
          </div>
        </div>
      </div>

      {/* Budget bar */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">งบประมาณโครงการ</span>
          <span className="text-sm font-bold text-gray-900">{formatCurrency(stats.budget)}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full flex rounded-full overflow-hidden">
            <div className="bg-ao-green transition-all" style={{ width: `${Math.min(stats.percent, 100)}%` }} />
            {stats.percent < 100 && stats.pending > 0 && (
              <div className="bg-amber-300 transition-all" style={{ width: `${Math.min((stats.pending / stats.budget) * 100, 100 - stats.percent)}%` }} />
            )}
          </div>
        </div>
        <div className="flex gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ao-green inline-block" />จ่ายแล้ว {formatCurrency(stats.spent)} ({stats.percent.toFixed(1)}%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />ค้างจ่าย {formatCurrency(stats.pending)}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-100 border border-gray-200 inline-block" />คงเหลือ {formatCurrency(Math.max(0, stats.budget - stats.spent - stats.pending))}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'PO ทั้งหมด', value: pos.length, icon: ClipboardList, color: 'text-ao-navy', bg: 'bg-ao-navy/10' },
          { label: 'จ่ายแล้ว', value: stats.paid.length, icon: CheckCircle2, color: 'text-ao-green', bg: 'bg-ao-green/10' },
          { label: 'รอดำเนินการ', value: stats.active.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'ยอดจ่ายรวม', value: formatCurrency(stats.spent), icon: Wallet, color: 'text-ao-navy', bg: 'bg-ao-navy/10', isText: true },
        ].map((k, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}>
              <k.icon size={18} className={k.color} />
            </div>
            <div>
              <p className={`${k.isText ? 'text-base' : 'text-2xl'} font-bold text-gray-900`}>{k.value}</p>
              <p className="text-xs text-gray-400">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Monthly trend */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">ยอดจ่าย 6 เดือนล่าสุด</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
              <ReTooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), 'ยอดจ่าย']} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {monthlyData.map((_, i) => <Cell key={i} fill={i === monthlyData.length - 1 ? '#00366D' : '#00CE81'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">สัดส่วนสถานะ PO</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={STATUS_PIE_COLORS[entry.key] || '#94a3b8'} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <ReTooltip formatter={(v, name) => [`${Number(v ?? 0)} PO`, String(name)]} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">ยังไม่มีข้อมูล</div>}
        </div>
      </div>

      {/* Cost Code breakdown */}
      {ccData.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-ao-navy" />
            <h3 className="text-sm font-semibold text-gray-700">ค่าใช้จ่ายจริงแยกตาม Cost Code (เฉพาะ Paid)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ccData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={80} />
              <ReTooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), 'ยอดจ่าย']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="amount" fill="#00366D" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent POs */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">PO ล่าสุด</h3>
          <Link href={`/po`} className="text-xs text-ao-green hover:underline">ดูทั้งหมด →</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400">เลข PO</th>
              <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400">ร้านค้า</th>
              <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-400">ยอดเงิน</th>
              <th className="text-center py-2.5 px-4 text-xs font-medium text-gray-400">วิธีจ่าย</th>
              <th className="text-center py-2.5 px-4 text-xs font-medium text-gray-400">สถานะ</th>
              <th className="text-right py-2.5 px-5 text-xs font-medium text-gray-400">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {pos.slice(0, 10).map(po => (
              <tr key={po.id} className="border-t border-gray-50 hover:bg-ao-green/5 transition-colors">
                <td className="py-3 px-5 font-mono text-xs text-ao-navy font-medium">{po.id}</td>
                <td className="py-3 px-4 text-gray-800 max-w-[200px] truncate">{po.shop_name}</td>
                <td className="py-3 px-4 text-right font-medium">{formatCurrency(Number(po.grand_total))}</td>
                <td className="py-3 px-4 text-center text-xs text-gray-500">{PAYMENT_LABELS[po.payment_method] || '-'}</td>
                <td className="py-3 px-4 text-center"><StatusBadge status={po.status as POStatus} /></td>
                <td className="py-3 px-5 text-right text-xs text-gray-400">{formatDateTime(po.created_at)}</td>
              </tr>
            ))}
            {pos.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">ยังไม่มี PO ในโครงการนี้</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
