export type Role = 'superadmin' | 'markaz_boshligi' | 'bolim_boshligi' | 'xodim'
export type VisitorType = 'xodim' | 'talaba' | 'mehmon'
export type Channel = 'offline' | 'telefon' | 'telegram'
export type AppealStatus = 'hal_qilindi' | 'hal_qilinmadi'
export type TaskStatus = 'yangi' | 'jarayonda' | 'bajarildi'
export type TaskVisibility = 'public' | 'private'

export interface User {
  id: string
  fullName: string
  username: string
  role: Role
  departmentId?: string
  telegramId?: string
  createdAt: string
}

export interface Department {
  id: string
  name: string
  createdAt: string
}

export interface Settings {
  appealStatusEnabled: boolean
  visitorTypeEnabled: boolean
  channelEnabled: boolean
  reportGenerationEnabled: boolean
}

export interface Appeal {
  id: string
  /** Murojaat nomi: ism yoki joy/muammo */
  title: string
  visitorType?: VisitorType
  channel?: Channel
  status?: AppealStatus
  comment?: string
  staffId: string
  staffName: string
  editable: boolean
  createdAt: string
  updatedAt: string
}

export interface AppealInput {
  title: string
  visitorType?: VisitorType
  channel?: Channel
  status?: AppealStatus
  comment?: string
}

export interface Range {
  from: string
  to: string
}

export interface Stats {
  range: Range
  total: number
  online: number
  offline: number
  byChannel: Record<Channel, number>
  byVisitorType: Record<VisitorType, number>
  byStatus: Record<AppealStatus, number>
  daily: Array<{ date: string; count: number }>
}

export interface Summary {
  today: number
  week: number
  month: number
}

interface Counts {
  total: number
  offline: number
  online: number
  resolved: number
}

export interface StaffRow extends Counts {
  staffId: string
  fullName: string
  username: string
  role: Role
  departmentId?: string
  departmentName?: string
}

export interface DepartmentRow extends Counts {
  departmentId: string | null
  name: string
  staffCount: number
}

export interface PersonRef {
  id: string
  fullName: string
}

export interface Task {
  id: string
  title: string
  description?: string
  deadline: string
  status: TaskStatus
  visibility: TaskVisibility
  assignees: PersonRef[]
  creator: PersonRef
  completedAt?: string
  createdAt: string
  updatedAt: string
  overdue: boolean
  commentsCount: number
  canManage: boolean
  allowedStatuses: TaskStatus[]
}

export interface TaskComment {
  id: string
  taskId: string
  authorId: string
  authorName: string
  text: string
  createdAt: string
}

export interface TaskInput {
  title: string
  description?: string
  deadline: string
  visibility: TaskVisibility
  assigneeIds: string[]
}

/* ---------- Choraklik hisobot ---------- */

export interface ReportItem {
  text: string
  sources: string[]
}

export interface ReportContent {
  summary: string
  months: Array<{ month: number; name: string; items: ReportItem[] }>
  extra: ReportItem[]
  conclusion: string[]
}

export interface ReportHeader {
  approverTitle: string
  approverName: string
  centerName: string
  departmentName: string
  signerTitle: string
  signerName: string
}

export interface ReportSource {
  ref: string
  kind: 'ish' | 'topshiriq'
  date: string
  text: string
  author: string
}

export interface QuarterlyReport {
  id: string
  departmentId: string
  year: number
  quarter: number
  status: 'generating' | 'ready' | 'failed'
  header: ReportHeader
  content?: ReportContent
  sources: ReportSource[]
  writer?: string
  error?: string
  generatedAt?: string
  updatedAt: string
}
