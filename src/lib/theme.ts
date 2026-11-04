/**
 * Mavzu: tizim (telefon/kompyuter sozlamasi), yorug' yoki qorong'i.
 * Tanlov shu brauzerda saqlanadi; "tizim"da Telegram ichida Telegram mavzusiga ergashadi.
 */
export type ThemeMode = 'system' | 'light' | 'dark'

const KEY = 'atm_theme'
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null
/** Telegram WebApp mavzusi (bot ichida ochilganda) */
let telegramScheme: 'light' | 'dark' | null = null
const listeners = new Set<() => void>()

export function getThemeMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function isDark(mode = getThemeMode()): boolean {
  if (mode !== 'system') return mode === 'dark'
  return telegramScheme ? telegramScheme === 'dark' : !!media?.matches
}

export function applyTheme() {
  const dark = isDark()
  document.documentElement.classList.toggle('dark', dark)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#09090b' : '#fafafa')
  listeners.forEach((l) => l())
}

export function setThemeMode(mode: ThemeMode) {
  try {
    if (mode === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, mode)
  } catch {
    /* saqlab bo'lmasa ham shu sahifada ishlaydi */
  }
  applyTheme()
}

export function setTelegramScheme(scheme?: 'light' | 'dark') {
  telegramScheme = scheme ?? null
  applyTheme()
}

export function onThemeChange(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function initTheme() {
  applyTheme()
  media?.addEventListener('change', () => getThemeMode() === 'system' && applyTheme())
}
