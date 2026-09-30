import { useMemo, useState, type FormEvent } from 'react'
import { useDepartments, useSaveTask, useUsers } from '../../api/hooks'
import type { Task, TaskVisibility, User } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABELS } from '../../lib/roles'
import { toDateInput, todayInput } from '../../lib/tasks'
import { Avatar, Button, ErrorText, Field, Input, Segmented, Textarea } from '../ui'

const VISIBILITY = [
  { value: 'public', label: 'Hamma ko\'rsin' },
  { value: 'private', label: 'Faqat ijrochilar' },
] as const satisfies ReadonlyArray<{ value: TaskVisibility; label: string }>

export function TaskForm({ task, onDone }: { task?: Task; onDone: () => void }) {
  const { user: me } = useAuth()
  const users = useUsers()
  const departments = useDepartments()
  const save = useSaveTask()
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [deadline, setDeadline] = useState(task ? toDateInput(task.deadline) : '')
  const [visibility, setVisibility] = useState<TaskVisibility>(task?.visibility ?? 'public')
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assignees.map((a) => a.id) ?? [])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // Barcha xodimlar bo'limlar bo'yicha guruhlanadi; o'z bo'limim eng tepada, bo'limsizlar oxirida
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = (users.data ?? []).filter((u) => !q || u.fullName.toLowerCase().includes(q))
    const names = new Map((departments.data ?? []).map((d) => [d.id, d.name]))
    const byDept = new Map<string, User[]>()
    for (const u of list) {
      const key = u.departmentId && names.has(u.departmentId) ? u.departmentId : ''
      byDept.set(key, [...(byDept.get(key) ?? []), u])
    }
    const rank = (key: string) => (key && key === me?.departmentId ? 0 : key ? 1 : 2)
    return [...byDept.entries()]
      .map(([key, members]) => ({
        key,
        name: key ? names.get(key)! : "Bo'limsiz",
        mine: !!key && key === me?.departmentId,
        members: members.sort((a, b) => a.fullName.localeCompare(b.fullName)),
      }))
      .sort((a, b) => rank(a.key) - rank(b.key) || a.name.localeCompare(b.name))
  }, [users.data, departments.data, me, search])

  const toggle = (id: string) => setAssigneeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (title.trim().length < 3) return setError('Sarlavha kamida 3 belgi bo\'lsin')
    if (!deadline) return setError('Muddatni belgilang')
    if (!assigneeIds.length) return setError('Kamida bitta ijrochi tanlang')
    try {
      await save.mutateAsync({ id: task?.id, title: title.trim(), description: description.trim(), deadline, visibility, assigneeIds })
      onDone()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Sarlavha">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Nima qilish kerak?" autoFocus />
      </Field>
      <Field label="Tavsif" hint="ixtiyoriy">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} rows={4} />
      </Field>
      <div className="grid gap-4">
        <Field label="Muddat">
          <Input type="date" value={deadline} min={task ? undefined : todayInput()} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Kim ko'radi</p>
          <Segmented label="Kim ko'radi" options={[...VISIBILITY]} value={visibility} onChange={setVisibility} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 flex justify-between text-sm font-medium text-slate-700">
          Ijrochilar <span className="text-xs font-normal text-slate-400">{assigneeIds.length} ta tanlandi</span>
        </p>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish…" aria-label="Xodimni qidirish" />
        <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-line-strong">
          {groups.map((g) => (
            <section key={g.key || 'none'} aria-label={g.name}>
              <h3 className="sticky top-0 z-10 flex items-center justify-between bg-slate-50/95 px-3 py-1.5 text-xs font-bold text-slate-500 backdrop-blur">
                {g.name}
                {g.mine && <span className="font-semibold text-brand-600">mening bo'limim</span>}
              </h3>
              <ul className="divide-y divide-line">
                {g.members.map((u) => (
                  <li key={u.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-hover">
                      <input type="checkbox" checked={assigneeIds.includes(u.id)} onChange={() => toggle(u.id)} className="size-4 accent-brand-600" />
                      <Avatar name={u.fullName} size="sm" />
                      <span className="flex-1 text-slate-800">{u.fullName}</span>
                      <span className="text-xs text-slate-400">{ROLE_LABELS[u.role]}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {!groups.length && <p className="px-3 py-3 text-center text-sm text-slate-400">Xodim topilmadi</p>}
        </div>
      </div>

      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" disabled={save.isPending}>
          {task ? 'Saqlash' : 'Topshiriq berish'}
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Bekor qilish
        </Button>
      </div>
    </form>
  )
}
