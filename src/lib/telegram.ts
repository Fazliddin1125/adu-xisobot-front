/**
 * Telegram WebApp (sayt bot ichida ochilganda).
 * Telegram manzilga #tgWebAppData=... qo'shadi — shundagina rasmiy skriptni yuklaymiz,
 * oddiy brauzerda telegram.org'ga so'rov ketmaydi.
 */
interface TelegramWebApp {
  initData: string
  ready(): void
  expand(): void
  close(): void
  HapticFeedback?: { notificationOccurred(type: 'success' | 'error' | 'warning'): void }
  setHeaderColor?(color: string): void
  setBackgroundColor?(color: string): void
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

/** Sayt Telegram ichida ochilganmi (birinchi yuklanishda hash'da tgWebAppData bo'ladi) */
const launchedInTelegram = typeof window !== 'undefined' && /tgWebAppData=/.test(window.location.hash)
// Hash keyingi navigatsiyada yo'qoladi — sessiya davomida eslab qolamiz
if (launchedInTelegram) {
  try {
    sessionStorage.setItem('tg-webapp', '1')
  } catch {
    /* maxfiy rejim — e'tiborsiz */
  }
}

export function isTelegramWebApp(): boolean {
  if (launchedInTelegram) return true
  try {
    return sessionStorage.getItem('tg-webapp') === '1'
  } catch {
    return false
  }
}

let loading: Promise<TelegramWebApp | null> | null = null

/** Telegram skriptini yuklaydi va WebApp obyektini qaytaradi (Telegram ichida bo'lmasa — null) */
export function telegramWebApp(): Promise<TelegramWebApp | null> {
  if (!isTelegramWebApp()) return Promise.resolve(null)
  if (window.Telegram?.WebApp) return Promise.resolve(window.Telegram.WebApp)
  loading ??= new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.onload = () => {
      const app = window.Telegram?.WebApp ?? null
      app?.ready()
      app?.expand()
      resolve(app)
    }
    script.onerror = () => resolve(null)
    document.head.appendChild(script)
  })
  return loading
}

export function haptic(type: 'success' | 'error') {
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type)
}
