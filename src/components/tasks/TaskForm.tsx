import { useMemo, useState, type FormEvent } from 'react'
import { useSaveTask, useUsers } from '../../api/hooks'
import type { Task, TaskVisibility } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { ROLE_LABELS } from '../../lib/roles'
import { toDateInput, todayInput } from '../../lib/tasks'
import { Button, ErrorText, Field, Input, Segmented, Textarea } from '../ui'

const VISIBILITY = [
  { value: 'public', label: 'Hamma ko\'rsin' },
  { value: 'private', label: 'Faqat ijrochilar' },
] as const satisfies ReadonlyArray<{ value: TaskVisibility; label: string }>

export function TaskForm({ task, onDone }: { task?: Task; onDone: () => void }) {
  const { user: me } = useAuth()
  const users = useUsers()
  const save = useSaveTask()
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [deadline, setDeadline] = useState(task ? toDateInput(task.deadline) : '')
  const [visibility, setVisibility] = useState<TaskVisibility>(task?.visibility ?? 'public')
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assignees.map((a) => a.id) ?? [])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // Bo'lim boshlig'i faqat o'z bo'limi xodimlarini tanlay oladi
  const candidates = useMemo(() => {
    const list = users.data ?? []
    const scoped = me?.role === 'bolim_boshligi' ? list.filter((u) => u.departmentId && u.departmentId === me.departmentId) : list
    const q = search.trim().toLowerCase()
    return q ? scoped.filter((u) => u.fullName.toLowerCase().includes(q)) : scoped
  }, [users.data, me, search])

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
      <div className="grid gap-4 sm:grid-cols-[11rem_1fr]">
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
        <ul className="mt-2 max-h-48 divide-y divide-line overflow-y-auto rounded-lg border border-slate-200">
          {candidates.map((u) => (
            <li key={u.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-[rgba(55,53,47,0.03)]">
                <input type="checkbox" checked={assigneeIds.includes(u.id)} onChange={() => toggle(u.id)} className="size-4 accent-brand-600" />
                <span className="flex-1 text-slate-800">{u.fullName}</span>
                <span className="text-xs text-slate-400">{ROLE_LABELS[u.role]}</span>
              </label>
            </li>
          ))}
          {!candidates.length && <li className="px-3 py-3 text-center text-sm text-slate-400">Xodim topilmadi</li>}
        </ul>
        {me?.role === 'bolim_boshligi' && <p className="mt-1 text-xs text-slate-500">Faqat o'z bo'limingiz xodimlari ko'rsatilgan</p>}
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
