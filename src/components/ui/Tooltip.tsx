'use client'

import * as RadixTooltip from '@radix-ui/react-tooltip'

export const TooltipProvider = RadixTooltip.Provider

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={300}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium shadow-lg
                     data-[state=delayed-open]:animate-in data-[state=closed]:animate-out
                     data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0
                     data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95"
        >
          {content}
          <RadixTooltip.Arrow className="fill-gray-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
