'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { UserProfile } from '@/lib/types'
import AOLogo from '@/components/AOLogo'

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) {
          setProfile(data as UserProfile)
          setDisplayName(data.display_name)
        }
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    await supabase
      .from('user_profiles')
      .update({ display_name: displayName })
      .eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่า</h1>
        <p className="text-sm text-gray-400 mt-0.5">จัดการโปรไฟล์และการตั้งค่าระบบ</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">โปรไฟล์</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อที่แสดง</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="input-field max-w-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm"
          >
            {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว ✓' : 'บันทึก'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">เกี่ยวกับระบบ</h2>
        <div className="flex items-center gap-4 mb-3">
          <AOLogo size="md" />
        </div>
        <p className="text-sm text-gray-500">AO Procurement Web v0.1.0</p>
        <p className="text-xs text-gray-400 mt-1">Powered by Supabase + Next.js</p>
      </div>
    </div>
  )
}
