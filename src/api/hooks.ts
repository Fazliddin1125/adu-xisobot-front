import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type {
  Appeal,
  AppealInput,
  Department,
  DepartmentRow,
  Role,
  Settings,
  StaffRow,
  Stats,
  Summary,
  Task,
  TaskComment,
  TaskInput,
  TaskStatus,
  User,
} from './types'
import { periodQuery, type PeriodValue } from '../lib/period'

export interface Scope {
  staffId?: string
  departmentId?: string
}

function useInvalidate(keys: string[]) {
  const qc = useQueryClient()
  return () => Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })))
}

/* ---------- Sozlamalar va bo'limlar ---------- */

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => api.get<Settings>('/settings'), staleTime: 60_000 })

/** Murojaatning qaysi ixtiyoriy maydonlari yoqilgan (superadmin sozlamasi) */
export function useAppealFields() {
  const s = useSettings().data
  return {
    status: s?.appealStatusEnabled ?? true,
    visitorType: s?.visitorTypeEnabled ?? true,
    channel: s?.channelEnabled ?? true,
  }
}

export function useUpdateSettings() {
  const invalidate = useInvalidate(['settings'])
  return useMutation({ mutationFn: (s: Partial<Settings>) => api.patch<Settings>('/admin/settings', s), onSuccess: invalidate })
}

export const useDepartments = () => useQuery({ queryKey: ['departments'], queryFn: () => api.get<Department[]>('/departments') })

export function useSaveDepartment() {
  const invalidate = useInvalidate(['departments', 'staff-stats'])
  return useMutation({
    mutationFn: ({ id, name }: { id?: string; name: string }) =>
      id ? api.patch<Department>(`/admin/departments/${id}`, { name }) : api.post<Department>('/admin/departments', { name }),
    onSuccess: invalidate,
  })
}

export function useDeleteDepartment() {
  const invalidate = useInvalidate(['departments'])
  return useMutation({ mutationFn: (id: string) => api.delete(`/admin/departments/${id}`), onSuccess: invalidate })
}

/* ---------- Murojaatlar va statistika ---------- */

export const useSummary = () => useQuery({ queryKey: ['summary'], queryFn: () => api.get<Summary>('/stats/summary') })

export const useStats = (period: PeriodValue, scope: Scope = {}) =>
  useQuery({
    queryKey: ['stats', period, scope],
    queryFn: () => api.get<Stats>(`/stats${periodQuery(period, { ...scope })}`),
  })

export const useAppeals = (period: PeriodValue, scope: Scope = {}) =>
  useQuery({
    queryKey: ['appeals', period, scope],
    queryFn: () => api.get<Appeal[]>(`/appeals${periodQuery(period, { ...scope })}`),
  })

export const useStaffStats = (period: PeriodValue, departmentId?: string) =>
  useQuery({
    queryKey: ['staff-stats', period, departmentId],
    queryFn: () => api.get<{ rows: StaffRow[]; departments: DepartmentRow[] }>(`/reports/staff${periodQuery(period, { departmentId })}`),
  })

export const exportAppeals = (period: PeriodValue, scope: Scope = {}) => api.download(`/reports/export${periodQuery(period, { ...scope })}`)

const APPEAL_KEYS = ['appeals', 'stats', 'summary', 'staff-stats']

export function useCreateAppeal() {
  const invalidate = useInvalidate(APPEAL_KEYS)
  return useMutation({ mutationFn: (input: AppealInput) => api.post<Appeal>('/appeals', input), onSuccess: invalidate })
}

export function useUpdateAppeal() {
  const invalidate = useInvalidate(APPEAL_KEYS)
  return useMutation({
    mutationFn: ({ id, ...input }: AppealInput & { id: string }) => api.patch<Appeal>(`/appeals/${id}`, input),
    onSuccess: invalidate,
  })
}

export function useDeleteAppeal() {
  const invalidate = useInvalidate(APPEAL_KEYS)
  return useMutation({ mutationFn: (id: string) => api.delete(`/appeals/${id}`), onSuccess: invalidate })
}

/* ---------- Foydalanuvchilar ---------- */

export const useUsers = (enabled = true) => useQuery({ queryKey: ['users'], queryFn: () => api.get<User[]>('/users'), enabled })
export const useUser = (id: string) => useQuery({ queryKey: ['users', id], queryFn: () => api.get<User>(`/users/${id}`) })

export interface UserInput {
  fullName?: string
  username?: string
  password?: string
  role?: Role
  departmentId?: string | null
  telegramId?: string | null
}

export function useSaveUser() {
  const invalidate = useInvalidate(['users', 'staff-stats'])
  return useMutation({
    mutationFn: ({ id, ...input }: UserInput & { id?: string }) =>
      id ? api.patch<User>(`/admin/users/${id}`, input) : api.post<User>('/admin/users', input),
    onSuccess: invalidate,
  })
}

export function useDeleteUser() {
  const invalidate = useInvalidate(['users', 'staff-stats'])
  return useMutation({ mutationFn: (id: string) => api.delete(`/admin/users/${id}`), onSuccess: invalidate })
}

export const useTelegramTest = () => useMutation({ mutationFn: (id: string) => api.post<void>(`/admin/users/${id}/telegram-test`, {}) })

export const useChangePassword = () =>
  useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => api.patch<void>('/auth/password', input),
  })

/* ---------- Topshiriqlar ---------- */

export interface TaskQuery {
  scope?: 'all' | 'mine'
  assigneeId?: string
  includeArchive?: boolean
}

export const useTasks = (q: TaskQuery) =>
  useQuery({
    queryKey: ['tasks', q],
    queryFn: () => {
      const params = new URLSearchParams()
      if (q.scope) params.set('scope', q.scope)
      if (q.assigneeId) params.set('assigneeId', q.assigneeId)
      if (q.includeArchive) params.set('includeArchive', 'true')
      return api.get<Task[]>(`/tasks?${params}`)
    },
  })

export const useTask = (id: string) =>
  useQuery({ queryKey: ['task', id], queryFn: () => api.get<Task & { comments: TaskComment[] }>(`/tasks/${id}`) })

const TASK_KEYS = ['tasks', 'task']

export function useSaveTask() {
  const invalidate = useInvalidate(TASK_KEYS)
  return useMutation({
    mutationFn: ({ id, ...input }: TaskInput & { id?: string }) =>
      id ? api.patch<Task>(`/tasks/${id}`, input) : api.post<Task>('/tasks', input),
    onSuccess: invalidate,
  })
}

export function useMoveTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: TaskStatus; comment?: string }) =>
      api.patch<Task>(`/tasks/${id}/status`, { status, comment }),
    // Doskada kartochka darhol ko'chadi, server javobidan keyin yangilanadi
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const snapshots = qc.getQueriesData<Task[]>({ queryKey: ['tasks'] })
      for (const [key, data] of snapshots) {
        if (data) qc.setQueryData(key, data.map((t) => (t.id === id ? { ...t, status } : t)))
      }
      return { snapshots }
    },
    onError: (_e, _v, ctx) => ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => Promise.all(TASK_KEYS.map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  })
}

export function useDeleteTask() {
  const invalidate = useInvalidate(TASK_KEYS)
  return useMutation({ mutationFn: (id: string) => api.delete(`/tasks/${id}`), onSuccess: invalidate })
}

export function useAddComment() {
  const invalidate = useInvalidate(TASK_KEYS)
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => api.post<TaskComment>(`/tasks/${id}/comments`, { text }),
    onSuccess: invalidate,
  })
}
