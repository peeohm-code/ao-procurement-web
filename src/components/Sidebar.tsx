'use client'

import { useState, useEffect } from 'react'
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
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={clsx(
        'flex flex-col bg-white border-r border-gray-100 h-full',
        !mobile && 'transition-all duration-200',
        !mobile && (collapsed ? 'w-16' : 'w-60'),
        mobile && 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 flex-shrink-0">
        {(!collapsed || mobile) && <AOLogo size="sm" />}
        {mobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
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
                className={clsx('flex-shrink-0', isActive ? 'text-ao-green' : 'text-gray-400')}
              />
              {(!collapsed || mobile) && <span>{item.label}</span>}
              {isActive && (!collapsed || mobile) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ao-green" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-100 p-3 flex-shrink-0">
        {(!collapsed || mobile) && user && (
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
            collapsed && !mobile && 'justify-center'
          )}
        >
          <LogOut size={18} />
          {(!collapsed || mobile) && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen z-40">
        <NavContent mobile={false} />
      </aside>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-white rounded-xl shadow-md border border-gray-100 text-ao-navy"
        aria-label="เปิดเมนู"
      >
        <Menu size={20} />
      </button>

      {/* Mobile: drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="relative h-full shadow-2xl">
            <NavContent mobile={true} />
          </div>
        </div>
      )}
    </>
  )
}
