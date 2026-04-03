'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, ArrowRight, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import { Project, TempQuotation } from '@/lib/types'

interface ProjectWithStats extends Project {
  poCount: number
  paidCount: number
  spent: number
  pendingAmount: number
  budgetPercent: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: projData }, { data: poData }] = await Promise.all([
        supabase.from('projects').select('*').order('id'),
        supabase.from('temp_quotations').select('id, project_id, grand_total, status'),
      ])

      if (projData && poData) {
        const result = projData.map(proj => {
          const projPOs = poData.filter(po => po.project_id === proj.id)
          const paid = projPOs.filter(po => po.status === 'paid')
          const pending = projPOs.filter(po => !['paid', 'cancelled'].includes(po.status))
          const spent = paid.reduce((s, po) => s + Number(po.grand_total), 0)
          const pendingAmount = pending.reduce((s, po) => s + Number(po.grand_total), 0)
          return {
            ...proj,
            budget: Number(proj.budget),
            poCount: projPOs.length,
            paidCount: paid.length,
            spent,
            pendingAmount,
            budgetPercent: Number(proj.budget) > 0 ? (spent / Number(proj.budget)) * 100 : 0,
          }
        })
        setProjects(result)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /><div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-32 bg-gray-200 rounded-xl"/>)}</div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">โครงการทั้งหมด</h1>
        <p className="text-sm text-gray-400 mt-0.5">{projects.length} โครงการ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map(proj => (
          <Link
            key={proj.id}
            href={`/projects/${proj.id}`}
            className="card p-6 hover:border-ao-green/30 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ao-navy text-white flex items-center justify-center font-bold text-sm">
                  {proj.id.replace('P', '')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                  <p className="text-xs text-gray-400">{proj.id} &middot; {proj.status === 'active' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-ao-green transition-colors" />
            </div>

            {/* Budget bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">ใช้ไป {formatCurrency(proj.spent)}</span>
                <span className="text-gray-400">งบ {formatCurrency(proj.budget)}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    proj.budgetPercent > 90 ? 'bg-red-500' : proj.budgetPercent > 70 ? 'bg-amber-500' : 'bg-ao-green'
                  }`}
                  style={{ width: `${Math.min(proj.budgetPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-right text-gray-400 mt-1">{proj.budgetPercent.toFixed(1)}%</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">PO ทั้งหมด</p>
                <p className="text-lg font-bold text-gray-900">{proj.poCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">จ่ายแล้ว</p>
                <p className="text-lg font-bold text-ao-green">{proj.paidCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">ค้างจ่าย</p>
                <p className="text-sm font-bold text-amber-500">
                  {formatCurrency(proj.pendingAmount)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
