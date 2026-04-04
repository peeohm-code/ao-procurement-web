// ==========================================
// LINE LIFF Integration
// ==========================================
// Set NEXT_PUBLIC_LIFF_ID in Vercel env vars
// LIFF app URL: https://ao-procurement-web.vercel.app
// ==========================================

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || ''

export interface LiffProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

let initialized = false

// Initialize LIFF SDK (client-side only)
export async function initLiff(): Promise<boolean> {
  if (typeof window === 'undefined' || !LIFF_ID) return false
  if (initialized) return true

  try {
    const liff = (await import('@line/liff')).default
    await liff.init({ liffId: LIFF_ID })
    initialized = true
    return true
  } catch (err) {
    console.warn('[LIFF] init failed:', err)
    return false
  }
}

// Get LINE profile if running inside LIFF
export async function getLiffProfile(): Promise<LiffProfile | null> {
  if (typeof window === 'undefined' || !LIFF_ID) return null

  try {
    const liff = (await import('@line/liff')).default
    if (!initialized) await initLiff()
    if (!liff.isInClient()) return null         // Not inside LINE app
    if (!liff.isLoggedIn()) {
      liff.login()
      return null
    }
    const profile = await liff.getProfile()
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    }
  } catch (err) {
    console.warn('[LIFF] getProfile failed:', err)
    return null
  }
}

// Check if running in LINE in-app browser
export async function isInLineApp(): Promise<boolean> {
  if (typeof window === 'undefined' || !LIFF_ID) return false
  try {
    const liff = (await import('@line/liff')).default
    if (!initialized) await initLiff()
    return liff.isInClient()
  } catch {
    return false
  }
}

// Close LIFF window (goes back to LINE chat)
export async function closeLiff(): Promise<void> {
  if (typeof window === 'undefined' || !LIFF_ID) return
  try {
    const liff = (await import('@line/liff')).default
    if (liff.isInClient()) liff.closeWindow()
  } catch {
    // ignore
  }
}
