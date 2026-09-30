/** Sanalar va matnlarni odamga yaqin tilda ko'rsatish (Toshkent vaqti) */

const TZ = 'Asia/Tashkent'
const DAY = 86_400_000

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
const WEEKDAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

/** Toshkent bo'yicha sana qismlari */
function parts(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false, weekday: 'short' })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  )
  const hour = Number(p.hour) % 24
  return { y: Number(p.year), m: Number(p.month), d: Number(p.day), hour, minute: p.minute, weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) }
}

/** Kalendar kunlari farqi (Toshkent bo'yicha): bugun=0, ertaga=1, kecha=-1 */
function dayDiff(date: Date, now = new Date()) {
  const a = parts(date)
  const b = parts(now)
  return Math.round((Date.UTC(a.y, a.m - 1, a.d) - Date.UTC(b.y, b.m - 1, b.d)) / DAY)
}

export function greeting(now = new Date()): string {
  const h = parts(now).hour
  if (h < 5) return 'Xayrli tun'
  if (h < 12) return 'Xayrli tong'
  if (h < 18) return 'Xayrli kun'
  return 'Xayrli kech'
}

/** "Seshanba, 30-sentabr" */
export function longDate(now = new Date()): string {
  const p = parts(now)
  return `${WEEKDAYS[p.weekday]}, ${p.d}-${MONTHS[p.m - 1]}`
}

/** "12-oktabr" (yil boshqa bo'lsa "12-oktabr 2027") */
export function shortDate(iso: string, now = new Date()): string {
  const p = parts(new Date(iso))
  return `${p.d}-${MONTHS[p.m - 1]}${p.y !== parts(now).y ? ` ${p.y}` : ''}`
}

/** "hozirgina", "12 daqiqa oldin", "bugun 14:05", "kecha 09:12", "28-sentabr 16:40" */
export function relativeTime(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const mins = Math.floor((now.getTime() - date.getTime()) / 60_000)
  if (mins < 1) return 'hozirgina'
  if (mins < 60) return `${mins} daqiqa oldin`
  const p = parts(date)
  const time = `${String(p.hour).padStart(2, '0')}:${p.minute}`
  const diff = dayDiff(date, now)
  if (diff === 0) return `bugun ${time}`
  if (diff === -1) return `kecha ${time}`
  return `${shortDate(iso, now)} ${time}`
}

export type DeadlineTone = 'late' | 'soon' | 'ok' | 'done'

/** Muddat haqida odamcha matn: "Bugun tugaydi", "Ertaga", "3 kun qoldi", "2 kun kechikdi" */
export function deadlineText(iso: string, done: boolean, now = new Date()): { text: string; tone: DeadlineTone } {
  const diff = dayDiff(new Date(iso), now)
  if (done) return { text: shortDate(iso, now), tone: 'done' }
  if (diff < 0) return { text: diff === -1 ? 'Kecha tugagan' : `${-diff} kun kechikdi`, tone: 'late' }
  if (diff === 0) return { text: 'Bugun tugaydi', tone: 'soon' }
  if (diff === 1) return { text: 'Ertaga', tone: 'soon' }
  if (diff <= 7) return { text: `${diff} kun qoldi`, tone: 'ok' }
  return { text: shortDate(iso, now), tone: 'ok' }
}

/** Ismga qarab doim bir xil yumshoq rang (avatar uchun) */
const AVATAR_COLORS = [
  ['#fde4d3', '#8a3d12'],
  ['#e3ebff', '#3346a8'],
  ['#dff3e6', '#22643b'],
  ['#efe4fb', '#5b2d8f'],
  ['#fdf0d2', '#7a5410'],
  ['#fde2e0', '#9b2c26'],
  ['#dcf1f4', '#1d5f6b'],
  ['#fbe3f0', '#8a2660'],
]

export function avatarColors(name: string): { bg: string; fg: string } {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const [bg, fg] = AVATAR_COLORS[h % AVATAR_COLORS.length]
  return { bg, fg }
}

/** "Karimova Dilnoza" → "Dilnoza" (O'zbekcha tartib: familiya, ism) */
export function firstName(fullName: string): string {
  const p = fullName.trim().split(/\s+/)
  return p.length > 1 ? p[1] : p[0]
}

/** 1 → "1 ta murojaat" */
export const plural = (n: number, word: string) => `${n} ta ${word}`
