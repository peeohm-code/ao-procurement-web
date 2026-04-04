'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  CalendarDays,
  PieChart as PieChartIcon,
  BarChart3,
  Inbox,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatNumber } from '@/lib/format'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import OnboardingChecklist from '@/components/OnboardingChecklist'
import { TempQuotation, Project, POStatus } from '@/lib/types'

// ==========================================
// Types
// ==========================================

interface DashboardStats {
  totalPO: number
  totalSpent: number
  pendingCount: number
  paidCount: number
  monthPO: number
  monthSpent: number
  lastMonthSpent: number
  budgetUsedPercent: number
}

interface ProjectSummary extends Project {
  poCount: number
  spent: number
  budgetPercent: number
}

interface MonthlyData {
  month: string
  amount: number
}

interface StatusData {
  name: string
  value: number
  color: string
}

// ==========================================
// Constants
// ==========================================

const CHART_COLORS = ['#00CE81', '#00366D', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899']

const STATUS_CHART_COLORS: Record<string, string> = {
  'จ่ายแล้ว': '#10B981',
  'อนุมัติ': '#00CE81',
  'รอโอนเงิน': '#F59E0B',
  'รอใบเสร็จ': '#F97316',
  'รอเครดิต': '#06B6D4',
  'รอยืนยัน CC': '#EAB308',
  'รอเทียบราคา': '#8B5CF6',
  'ยกเลิก': '#EF4444',
  'อื่นๆ': '#94A3B8',
}

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

const STATUS_DISPLAY: Record<string, string> = {
  paid: 'จ่ายแล้ว',
  approved: 'อนุมัติ',
  awaiting_transfer: 'รอโอนเงิน',
  awaiting_receipt: 'รอใบเสร็จ',
  pending_credit: 'รอเครดิต',
  pending_cc: 'รอยืนยัน CC',
  awaiting_compare: 'รอเทียบราคา',
  cancelled: 'ยกเลิก',
}

// ==========================================
// Custom Tooltip
// ==========================================

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-100 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold text-gray-900">
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-100 text-sm">
      <p className="font-medium text-gray-700">{payload[0].name}</p>
      <p className="text-gray-900 font-semibold">{payload[0].value} PO</p>
    </div>
  )
}

// ==========================================
// Main Dashboard
// ==========================================

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPO: 0, totalSpent: 0, pendingCount: 0, paidCount: 0,
    monthPO: 0, monthSpent: 0, lastMonthSpent: 0, budgetUsedPercent: 0,
  })
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [recentPOs, setRecentPOs] = useState<TempQuotation[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboard() {
      const { data: projectData } = await supabase
        .from('projects').select('*').eq('status', 'active').order('id')
      const { data: poData } = await supabase
        .from('temp_quotations').select('*').order('created_at', { ascending: false })

      if (projectData && poData) {
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()

        // Basic stats
        const paid = poData.filter(po => po.status === 'paid')
        const pending = poData.filter(po => !['paid', 'cancelled'].includes(po.status))
        const totalSpent = paid.reduce((sum, po) => sum + Number(po.grand_total), 0)

        // This month stats
        const thisMonthPOs = poData.filter(po => {
          const d = new Date(po.created_at)
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear
        })
        const monthSpent = thisMonthPOs
          .filter(po => po.status === 'paid')
          .reduce((sum, po) => sum + Number(po.grand_total), 0)

        // Last month stats (for trend)
        const lastMonthPOs = poData.filter(po => {
          const d = new Date(po.created_at)
          const lm = thisMonth === 0 ? 11 : thisMonth - 1
          const ly = thisMonth === 0 ? thisYear - 1 : thisYear
          return d.getMonth() === lm && d.getFullYear() === ly
        })
        const lastMonthSpent = lastMonthPOs
          .filter(po => po.status === 'paid')
          .reduce((sum, po) => sum + Number(po.grand_total), 0)

        // Budget used %
        const totalBudget = projectData.reduce((sum, p) => sum + Number(p.budget), 0)
        const budgetUsedPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

        setStats({
          totalPO: poData.length,
          totalSpent,
          pendingCount: pending.length,
          paidCount: paid.length,
          monthPO: thisMonthPOs.length,
          monthSpent,
          lastMonthSpent,
          budgetUsedPercent,
        })

        // Monthly chart data (last 6 months)
        const monthly: MonthlyData[] = []
        for (let i = 5; i >= 0; i--) {
          const m = new Date(thisYear, thisMonth - i, 1)
          const mPaid = poData.filter(po => {
            if (po.status !== 'paid') return false
            const d = new Date(po.created_at)
            return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()
          })
          monthly.push({
            month: THAI_MONTHS[m.getMonth()],
            amount: mPaid.reduce((sum, po) => sum + Number(po.grand_total), 0),
          })
        }
        setMonthlyData(monthly)

        // Status distribution
        const statusCounts: Record<string, number> = {}
        poData.forEach(po => {
          const label = STATUS_DISPLAY[po.status] || 'อื่นๆ'
          statusCounts[label] = (statusCounts[label] || 0) + 1
        })
        const sd: StatusData[] = Object.entries(statusCounts)
          .map(([name, value]) => ({
            name,
            value,
            color: STATUS_CHART_COLORS[name] || '#94A3B8',
          }))
          .sort((a, b) => b.value - a.value)
        setStatusData(sd)

        // Project summaries
        const summaries: ProjectSummary[] = projectData.map(proj => {
          const projPOs = poData.filter(po => po.project_id === proj.id)
          const projPaid = projPOs.filter(po => po.status === 'paid')
          const spent = projPaid.reduce((sum, po) => sum + Number(po.grand_total), 0)
          return {
            ...proj,
            budget: Number(proj.budget),
            poCount: projPOs.length,
            spent,
            budgetPercent: Number(proj.budget) > 0 ? (spent / Number(proj.budget)) * 100 : 0,
          }
        })
        setProjects(summaries)

        // Recent POs
        setRecentPOs(
          poData.filter(po => po.status !== 'cancelled').slice(0, 8) as TempQuotation[]
        )
      }

      setLoading(false)
    }
    loadDashboard()
  }, [])

  // Trend calculation
  const spentTrend = stats.lastMonthSpent > 0
    ? ((stats.monthSpent - stats.lastMonthSpent) / stats.lastMonthSpent * 100)
    : 0

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 bg-gray-200 rounded-2xl" />
          <div className="h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  const isEmpty = stats.totalPO === 0

  return (
    <div className="space-y-6">
      {/* Header — pl-12 on mobile to clear hamburger button */}
      <div className="pl-12 lg:pl-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">ภาพรวมระบบจัดซื้อทุกโครงการ</p>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist
        hasPO={stats.totalPO > 0}
        hasApproved={stats.paidCount > 0 || stats.pendingCount > 0}
        hasPaid={stats.paidCount > 0}
      />

      {/* Stats Cards — 6 cards in 2 rows */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="PO ทั้งหมด"
          value={formatNumber(stats.totalPO)}
          icon={<FileText size={20} />}
          gradient="from-ao-navy to-ao-navy-light"
        />
        <StatCard
          label="ยอดจ่ายแล้ว"
          value={formatCurrency(stats.totalSpent)}
          icon={<TrendingUp size={20} />}
          gradient="from-ao-green to-ao-green-dark"
        />
        <StatCard
          label="PO จ่ายแล้ว"
          value={formatNumber(stats.paidCount)}
          icon={<Clock size={20} />}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          label="รอดำเนินการ"
          value={formatNumber(stats.pendingCount)}
          icon={<AlertCircle size={20} />}
          gradient="from-amber-400 to-amber-500"
          alert={stats.pendingCount > 5}
        />
        <StatCard
          label="PO เดือนนี้"
          value={formatNumber(stats.monthPO)}
          icon={<CalendarDays size={20} />}
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          label="งบใช้ไปแล้ว"
          value={`${stats.budgetUsedPercent.toFixed(1)}%`}
          icon={<PieChartIcon size={20} />}
          gradient={
            stats.budgetUsedPercent > 90
              ? 'from-red-500 to-red-600'
              : stats.budgetUsedPercent > 70
              ? 'from-amber-500 to-amber-600'
              : 'from-cyan-500 to-cyan-600'
          }
        />
      </div>

      {/* Charts Row */}
      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Spending Chart */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={18} className="text-ao-navy" />
              <h2 className="text-base font-semibold text-gray-900">ค่าใช้จ่ายรายเดือน</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} barSize={36}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="amount"
                  fill="#00CE81"
                  radius={[8, 8, 0, 0]}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <PieChartIcon size={18} className="text-ao-navy" />
              <h2 className="text-base font-semibold text-gray-900">สัดส่วนสถานะ PO</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Projects Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">โครงการทั้งหมด</h2>
          <Link
            href="/projects"
            className="text-sm text-ao-green hover:text-ao-green-dark flex items-center gap-1 font-medium"
          >
            ดูทั้งหมด <ArrowRight size={14} />
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<Building2 size={28} className="text-gray-300" />}
            title="ยังไม่มีโครงการ"
            description="ติดต่อ Admin เพื่อเพิ่มโครงการใหม่เข้าสู่ระบบ"
          />
        ) : (
          <div className="space-y-3">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="block p-4 rounded-xl border border-gray-100 hover:border-ao-green/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ao-navy/10 to-ao-navy/5 flex items-center justify-center group-hover:from-ao-green/10 group-hover:to-ao-green/5 transition-colors">
                      <Building2 size={16} className="text-ao-navy group-hover:text-ao-green transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{proj.id} — {proj.name}</p>
                      <p className="text-xs text-gray-400">{proj.poCount} PO</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(proj.spent)}
                    </p>
                    <p className="text-xs text-gray-400">
                      จาก {formatCurrency(proj.budget)}
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      proj.budgetPercent > 90
                        ? 'bg-gradient-to-r from-red-400 to-red-500'
                        : proj.budgetPercent > 70
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gradient-to-r from-ao-green to-ao-green-light'
                    }`}
                    style={{ width: `${Math.min(proj.budgetPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 text-right">
                  {proj.budgetPercent.toFixed(1)}% ของงบประมาณ
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent POs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">PO ล่าสุด</h2>
          <Link
            href="/po"
            className="text-sm text-ao-green hover:text-ao-green-dark flex items-center gap-1 font-medium"
          >
            ดูทั้งหมด <ArrowRight size={14} />
          </Link>
        </div>

        {recentPOs.length === 0 ? (
          <EmptyState
            icon={<Inbox size={28} className="text-gray-300" />}
            title="ยังไม่มี PO ในระบบ"
            description="ส่งรูปใบเสนอราคาผ่าน LINE OA เพื่อเริ่มต้นสร้าง PO อัตโนมัติ"
            action={
              <span className="inline-flex items-center gap-2 text-sm text-ao-green font-medium">
                <FileText size={16} /> ดูวิธีส่งใบเสนอราคา
              </span>
            }
          />
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-6 text-xs font-medium text-gray-400 uppercase">เลข PO</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">โครงการ</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">ร้านค้า</th>
                  <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">ยอดเงิน</th>
                  <th className="text-center py-2.5 px-6 text-xs font-medium text-gray-400 uppercase">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {recentPOs.map((po) => (
                  <tr key={po.id} className="border-b border-gray-50 hover:bg-ao-green/5 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs text-ao-navy font-medium">{po.id}</td>
                    <td className="py-3 px-3 text-gray-600">{po.project_id}</td>
                    <td className="py-3 px-3 text-gray-900 max-w-[200px] truncate">{po.shop_name}</td>
                    <td className="py-3 px-3 text-right font-medium">{formatCurrency(Number(po.grand_total))}</td>
                    <td className="py-3 px-6 text-center">
                      <StatusBadge status={po.status as POStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// StatCard Component
// ==========================================

function StatCard({
  label,
  value,
  icon,
  gradient,
  trend,
  trendUp,
  alert,
}: {
  label: string
  value: string
  icon: React.ReactNode
  gradient: string
  trend?: string
  trendUp?: boolean
  alert?: boolean
}) {
  return (
    <div className={`card p-5 hover:shadow-md transition-all duration-200 ${alert ? 'ring-1 ring-amber-200' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400 font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-1.5">
          {trendUp ? (
            <TrendingUp size={14} className="text-emerald-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span className={`text-xs font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend}
          </span>
          <span className="text-xs text-gray-400">จากเดือนก่อน</span>
        </div>
      )}
    </div>
  )
}
