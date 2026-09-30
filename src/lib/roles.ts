import type { Role } from '../api/types'

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Superadmin',
  markaz_boshligi: "Markaz boshlig'i",
  bolim_boshligi: "Bo'lim boshlig'i",
  xodim: 'Xodim',
}

export const ROLE_OPTIONS: Array<{ value: Role; label: string }> = (Object.keys(ROLE_LABELS) as Role[]).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}))

/** Rahbarlar: hamma murojaat/topshiriqni ko'radi, hisobot va Excel, topshiriq beradi */
export const isManager = (role?: Role) => role === 'superadmin' || role === 'markaz_boshligi' || role === 'bolim_boshligi'
export const isSuperadmin = (role?: Role) => role === 'superadmin'
