import type { TaskStatus } from '../api/types'
import type { Tone } from '../components/ui'

/** Notion "Status" xususiyati: teg rangi, nuqta rangi, ustun foni */
export const TASK_COLUMNS: Array<{ status: TaskStatus; label: string; tone: Tone; dot: string; bg: string }> = [
  { status: 'yangi', label: 'Yangi', tone: 'slate', dot: 'bg-[#91918e]', bg: 'bg-col-gray' },
  { status: 'jarayonda', label: 'Jarayonda', tone: 'blue', dot: 'bg-[#5b97bd]', bg: 'bg-col-blue' },
  { status: 'tekshiruvda', label: 'Tekshiruvda', tone: 'amber', dot: 'bg-[#cb912f]', bg: 'bg-col-yellow' },
  { status: 'bajarildi', label: 'Bajarildi', tone: 'green', dot: 'bg-[#6c9b7d]', bg: 'bg-col-green' },
]

export const TASK_COLUMN = Object.fromEntries(TASK_COLUMNS.map((c) => [c.status, c])) as Record<TaskStatus, (typeof TASK_COLUMNS)[number]>

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  yangi: 'Yangi',
  jarayonda: 'Jarayonda',
  tekshiruvda: 'Tekshiruvda',
  bajarildi: 'Bajarildi',
}

/** Bosqichga o'tkazish tugmasi matni */
export const MOVE_LABELS: Record<TaskStatus, string> = {
  yangi: 'Yangiga qaytarish',
  jarayonda: 'Ishni boshlash',
  tekshiruvda: 'Tekshiruvga yuborish',
  bajarildi: 'Qabul qilish (bajarildi)',
}

const TZ = 'Asia/Tashkent'

/** "27.09.2026" */
export function formatDeadline(iso: string): string {
  return toDateInput(iso).split('-').reverse().join('.')
}

/** ISO → "YYYY-MM-DD" (Toshkent) — date input uchun */
export function toDateInput(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
}

export function todayInput(): string {
  return toDateInput(new Date().toISOString())
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}
