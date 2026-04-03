'use client'

import { POStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import clsx from 'clsx'

export default function StatusBadge({ status }: { status: POStatus }) {
  return (
    <span className={clsx('badge', STATUS_COLORS[status] || 'bg-gray-100 text-gray-600')}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
