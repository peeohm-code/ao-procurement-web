'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Settings,
  Store,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import AOLogo from './AOLogo'
import { UserProfile } from '@/lib/types'
import clsx from 'clsx'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  procurement: 'Procurement',
  manager: 'Manager',
  viewer: 'Viewer',
}

interface SidebarProps {
  user: UserProfile | null
  onSignOut: () => void
}

export default function Sidebar({ user, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/po', label: 'PO ทั้งหมด', icon: FileText },
    { href: '/projects', label: 'โครงการ', icon: FolderOpen },
    { href: '/vendors', label: 'ร้านค้า', icon: Store },
    { href: '/help', label: 'Help Center', icon: LifeBuoy },
    ...(user?.role === 'owner'
      ? [{ href: '/users', label: 'จัดการผู้ใช้', icon: Users }]
      : []),
    { href: '/settings', label: 'ตั้งค่า', icon: Settings },
  ]

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        {!collapsed && <AOLogo size="sm" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-ao-green/10 text-ao-navy'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                size={20}
                className={isActive ? 'text-ao-green' : 'text-gray-400'}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ao-green" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-100 p-3">
        {!collapsed && user && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.display_name || user.email}
            </p>
            <p className="text-xs text-gray-400">
              {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
        )}
        <button
          onClick={onSignOut}
          className={clsx(
            'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  )
}
