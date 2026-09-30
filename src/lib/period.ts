/** Davr tanlovi: 'today' | 'week' | 'month' | 'YYYY-MM' */
export type PeriodValue = string

const TZ = 'Asia/Tashkent'

export function currentMonthKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' }).format(new Date()).slice(0, 7)
}

export function periodQuery(value: PeriodValue, extra: Record<string, string | undefined> = {}): string {
  const params = new URLSearchParams()
  if (/^\d{4}-\d{2}$/.test(value)) params.set('month', value)
  else params.set('period', value)
  for (const [k, v] of Object.entries(extra)) if (v) params.set(k, v)
  return `?${params}`
}

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

export function periodLabel(value: PeriodValue): string {
  if (value === 'today') return 'Bugun'
  if (value === 'week') return 'Shu hafta'
  if (value === 'month') return 'Shu oy'
  return monthLabel(value)
}

/** Oxirgi n oy ro'yxati (joriy oydan orqaga) */
export function recentMonths(n = 12): string[] {
  const [y, m] = currentMonthKey().split('-').map(Number)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - i, 1))
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  })
}

/** "27.09.2026 14:05" (Toshkent) */
export function formatDateTime(iso: string): string {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
  return `${date.split('-').reverse().join('.')} ${formatTime(iso)}`
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('uz-UZ', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
}

/** "YYYY-MM-DD" → "28.09" */
export function shortDay(key: string): string {
  const [, m, d] = key.split('-')
  return `${d}.${m}`
}
