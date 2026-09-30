import type { AppealStatus, Channel, VisitorType } from '../api/types'

export const VISITOR_LABELS: Record<VisitorType, string> = { xodim: 'Xodim', talaba: 'Talaba', mehmon: 'Mehmon' }
export const CHANNEL_LABELS: Record<Channel, string> = { offline: 'Offline', telefon: 'Telefon', telegram: 'Telegram' }
export const STATUS_LABELS: Record<AppealStatus, string> = { hal_qilindi: 'Hal qilindi', hal_qilinmadi: 'Hal qilinmadi' }

export const isOnline = (c?: Channel) => !!c && c !== 'offline'
