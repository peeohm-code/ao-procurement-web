'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatCurrency, formatNumber } from '@/lib/format'
import StatusBadge from '@/components/StatusBadge'
import { TempQuotation, Project, POStatus } from '@/lib/types'

interface DashboardStats {
  totalPO: number
  totalSpent: number
  pendingCount: number
  paidCount: number
}

interface ProjectSummary extends Project {
  poCount: number
  spent: number
  budgetPercent: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalPO: 0, totalSpent: 0, pendingCount: 0, paidCount: 0 })
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [recentPOs, setRecentPOs] = useState<TempQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboard() {
      // Load projects
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('id')

      // Load all POs
      const { data: poData } = await supabase
        .from('temp_quotations')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectData && poData) {
        // Calculate stats
        const paid = poData.filter(po => po.status === 'paid')
        const pending = poData.filter(po =>
          !['paid', 'cancelled'].includes(po.status)
        )

        setStats({
          totalPO: poData.length,
          totalSpent: paid.reduce((sum, po) => sum + Number(po.grand_total), 0),
          pendingCount: pending.length,
          paidCount: paid.length,
        })

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

        // Recent POs (last 10, not cancelled)
        setRecentPOs(
          poData
            .filter(po => po.status !== 'cancelled')
            .slice(0, 8) as TempQuotation[]
        )
      }

      setLoading(false)
    }
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">ภาพรวมระบบจัดซื้อทุกโครงการ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="PO ทั้งหมด"
          value={formatNumber(stats.totalPO)}
          icon={<FileText size={20} />}
          color="bg-ao-navy"
        />
        <StatCard
          label="ยอดจ่ายแล้ว"
          value={formatCurrency(stats.totalSpent)}
          icon={<TrendingUp size={20} />}
          color="bg-ao-green"
        />
        <StatCard
          label="PO จ่ายแล้ว"
          value={formatNumber(stats.paidCount)}
          icon={<Clock size={20} />}
          color="bg-emerald-500"
        />
        <StatCard
          label="รอดำเนินการ"
          value={formatNumber(stats.pendingCount)}
          icon={<AlertCircle size={20} />}
          color="bg-amber-500"
        />
      </div>

      {/* Projects Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">โครงการทั้งหมด</h2>
          <Link
            href="/projects"
            className="text-sm text-ao-green hover:text-ao-green-dark flex items-center gap-1"
          >
            ดูทั้งหมด <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-4">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}`}
              className="block p-4 rounded-lg border border-gray-100 hover:border-ao-green/30 hover:bg-ao-green/5 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ao-navy/10 flex items-center justify-center">
                    <Building2 size={16} className="text-ao-navy" />
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
              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    proj.budgetPercent > 90
                      ? 'bg-red-500'
                      : proj.budgetPercent > 70
                      ? 'bg-amber-500'
                      : 'bg-ao-green'
                  }`}
                  style={{ width: `${Math.min(proj.budgetPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {proj.budgetPercent.toFixed(1)}% ของงบประมาณ
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent POs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">PO ล่าสุด</h2>
          <Link
            href="/po"
            className="text-sm text-ao-green hover:text-ao-green-dark flex items-center gap-1"
          >
            ดูทั้งหมด <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-400 uppercase">เลข PO</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-400 uppercase">โครงการ</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-400 uppercase">ร้านค้า</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-400 uppercase">ยอดเงิน</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-400 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentPOs.map((po) => (
                <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 font-mono text-xs text-ao-navy">{po.id}</td>
                  <td className="py-2.5 px-3 text-gray-600">{po.project_id}</td>
                  <td className="py-2.5 px-3 text-gray-900 max-w-[200px] truncate">{po.shop_name}</td>
                  <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(Number(po.grand_total))}</td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={po.status as POStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} text-white flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
