'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Shield, Edit2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { UserProfile, UserRole } from '@/lib/types'
import { formatDateTime } from '@/lib/format'
import clsx from 'clsx'

const ROLE_OPTIONS: { value: UserRole; label: string; color: string }[] = [
  { value: 'owner', label: 'Owner', color: 'bg-ao-navy text-white' },
  { value: 'procurement', label: 'Procurement', color: 'bg-ao-green text-white' },
  { value: 'manager', label: 'Manager', color: 'bg-blue-500 text-white' },
  { value: 'viewer', label: 'Viewer', color: 'bg-gray-200 text-gray-700' },
]

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<UserRole>('viewer')
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at')
    if (data) setUsers(data as UserProfile[])
    setLoading(false)
  }

  async function updateRole(userId: string) {
    await supabase
      .from('user_profiles')
      .update({ role: editRole })
      .eq('id', userId)
    setEditingId(null)
    loadUsers()
  }

  async function toggleActive(userId: string, currentActive: boolean) {
    await supabase
      .from('user_profiles')
      .update({ is_active: !currentActive })
      .eq('id', userId)
    loadUsers()
  }

  if (loading) {
    return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /><div className="h-64 bg-gray-200 rounded-xl" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} ผู้ใช้ในระบบ</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ผู้ใช้</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">สมัครเมื่อ</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-4 font-medium text-gray-900">
                  {u.display_name || '(ไม่มีชื่อ)'}
                </td>
                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                <td className="py-3 px-4 text-center">
                  {editingId === u.id ? (
                    <div className="flex items-center justify-center gap-1">
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value as UserRole)}
                        className="input-field w-auto text-xs py-1"
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <button onClick={() => updateRole(u.id)} className="p-1 text-ao-green hover:bg-ao-green/10 rounded">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className={clsx(
                      'badge',
                      ROLE_OPTIONS.find(r => r.value === u.role)?.color
                    )}>
                      {ROLE_OPTIONS.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => toggleActive(u.id, u.is_active)}
                    className={clsx(
                      'badge cursor-pointer',
                      u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}
                  >
                    {u.is_active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right text-gray-400 text-xs">
                  {formatDateTime(u.created_at)}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => { setEditingId(u.id); setEditRole(u.role) }}
                    className="p-1.5 text-gray-400 hover:text-ao-navy hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-4 bg-ao-navy/5 border-ao-navy/10">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-ao-navy mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">เกี่ยวกับ Role</p>
            <p><strong>Owner</strong> — เข้าถึงทุกอย่าง, จัดการผู้ใช้, ดูทุกโครงการ</p>
            <p><strong>Procurement</strong> — ดู/แก้ไข PO, approve, จัดการ vendor</p>
            <p><strong>Manager</strong> — ดู Dashboard, ดูรายงาน, export</p>
            <p><strong>Viewer</strong> — ดูอย่างเดียว (เฉพาะโครงการที่ได้สิทธิ์)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
