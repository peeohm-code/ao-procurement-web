'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// ─── PostHog init ──────────────────────────────────────────────
// Set NEXT_PUBLIC_POSTHOG_KEY in Vercel env vars
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

if (typeof window !== 'undefined' && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,      // Manual pageview tracking below
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    autocapture: false,           // Only track what we explicitly capture
    disable_session_recording: false,
  })
}

// ─── Pageview tracker (needs Suspense for useSearchParams) ─────
function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && POSTHOG_KEY) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        pathname,
      })
    }
  }, [pathname, searchParams])

  return null
}

// ─── Provider wrapper ──────────────────────────────────────────
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY) {
    // No key configured — skip PostHog entirely (dev / preview)
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  )
}
