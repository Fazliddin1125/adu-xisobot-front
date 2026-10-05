import { useState, type FormEvent } from 'react'
import { CalendarDays, CircleCheck, CircleDot, Hand, Undo2, Clock3, Eye, Lock, Pencil, Pin, Trash2, UserRound, Users } from 'lucide-react'
import type { TaskStatus } from '../../api/types'
import { useAddComment, useClaimTask, useDeleteTask, useMoveTask, useTask } from '../../api/hooks'
import { formatDateTime } from '../../lib/period'
import { firstName, relativeTime } from '../../lib/humanize'
import { MOVE_LABELS, TASK_COLUMN, formatDeadline, isReturn } from '../../lib/tasks'
import { ReturnForm } from './ReturnForm'
import { Modal } from '../Modal'
import { Avatar, Badge, Button, ErrorText, Loading, Property, Textarea } from '../ui'
import { useToast } from '../Toast'
import { DeadlineChip } from './DeadlineChip'
import { TaskForm } from './TaskForm'

function Person({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full py-0.5 pr-2 pl-0.5">
      <Avatar name={name} size="sm" />
      {name}
    </span>
  )
}

/** Topshiriq — Notion sahifasi ko'rinishida: sarlavha, xususiyatlar, tavsif, izohlar */
export function TaskDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: task, isLoading } = useTask(id)
  const move = useMoveTask()
  const remove = useDeleteTask()
  const addComment = useAddComment()
  const claim = useClaimTask()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  /** Bajarilganni qaytarish uchun izoh formasi ochiqmi */
  const [returnTo, setReturnTo] = useState<TaskStatus | null>(null)
  const [text, setText] = useState('')

  if (editing && task) {
    return (
      <Modal title="Topshiriqni tahrirlash" onClose={() => setEditing(false)}>
        <TaskForm task={task} onDone={() => setEditing(false)} />
      </Modal>
    )
  }

  async function handleDelete() {
    if (!task || !confirm(`"${task.title}" topshirig'ini o'chirasizmi?`)) return
    await remove.mutateAsync(task.id)
    toast.success("Topshiriq o'chirildi")
    onClose()
  }

  async function handleClaim() {
    try {
      await claim.mutateAsync(id)
      toast.success('Ish endi sizning zimmangizda')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await addComment.mutateAsync({ id, text: text.trim() })
    setText('')
  }

  const col = task ? TASK_COLUMN[task.status] : null

  return (
    <Modal title="Topshiriqlar / Topshiriq" onClose={onClose} wide>
      {isLoading || !task || !col ? (
        <Loading />
      ) : (
        <article>
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden>
            {task.visibility === 'private' ? <Lock className="size-6" strokeWidth={1.75} /> : <Pin className="size-6" strokeWidth={1.75} />}
          </div>
          <h1 className="mb-4 text-[28px] leading-tight font-bold break-words text-slate-800 sm:text-[32px]">{task.title}</h1>

          <div className="mb-4">
            <Property icon={CircleDot} label="Holat">
              <Badge tone={col.tone}>
                <span className={`size-2 rounded-full ${col.dot}`} />
                {col.label}
              </Badge>
            </Property>
            <Property icon={CalendarDays} label="Muddat">
              <span className="inline-flex flex-wrap items-center gap-2">
                <DeadlineChip deadline={task.deadline} done={task.status === 'bajarildi'} />
                <span className="text-slate-500">{formatDeadline(task.deadline)}</span>
              </span>
            </Property>
            <Property icon={Users} label="Ijrochilar">
              {task.assignees.length ? (
                <span className="-mx-1 flex flex-wrap gap-x-1">
                  {task.assignees.map((a) => (
                    <Person key={a.id} name={a.fullName} />
                  ))}
                </span>
              ) : (
                <Badge tone="orange">Egasi yo‘q — umumiy ish</Badge>
              )}
            </Property>
            <Property icon={UserRound} label="Topshiriq bergan">
              <span className="-mx-1">
                <Person name={task.creator.fullName} />
              </span>
            </Property>
            <Property icon={Eye} label="Kim ko'radi">
              {task.visibility === 'private' ? 'Faqat ijrochilar va rahbarlar' : 'Barcha xodimlar'}
            </Property>
            <Property icon={Clock3} label="Yaratilgan">
              <span className="text-slate-500">{relativeTime(task.createdAt)}</span>
            </Property>
          </div>

          {task.canClaim && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-tag-orange-bg/50 p-4">
              <p className="min-w-0 flex-1 text-sm text-slate-700">Bu ishning egasi yo‘q. Qabul qilsangiz, u sizning zimmangizga o‘tadi va "Jarayonda" bosqichiga ko‘chadi.</p>
              <Button onClick={handleClaim} disabled={claim.isPending}>
                <Hand className="size-4" strokeWidth={2} aria-hidden />
                Ishni qabul qilish
              </Button>
            </div>
          )}

          {(task.allowedStatuses.length > 0 || task.canManage) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {task.allowedStatuses.map((s) =>
                isReturn(task.status, s) ? (
                  <Button key={s} variant="secondary" onClick={() => setReturnTo(s)}>
                    <Undo2 className="size-4" strokeWidth={2} aria-hidden />
                    {s === 'jarayonda' ? 'Orqaga qaytarish' : MOVE_LABELS[s]}
                  </Button>
                ) : (
                  <Button
                    key={s}
                    variant={s === 'bajarildi' ? 'primary' : 'secondary'}
                    disabled={move.isPending}
                    onClick={() => move.mutate({ id, status: s }, { onSuccess: () => toast.success(s === 'bajarildi' ? 'Ajoyib! Topshiriq bajarildi' : `"${TASK_COLUMN[s].label}" bosqichiga o'tkazildi`) })}
                  >
                    {s === 'bajarildi' && <CircleCheck className="size-4" strokeWidth={2} aria-hidden />}
                    {MOVE_LABELS[s]}
                  </Button>
                ),
              )}
              {task.canManage && (
                <>
                  <Button variant="ghost" onClick={() => setEditing(true)}>
                    <Pencil className="size-4" strokeWidth={1.9} aria-hidden />
                    Tahrirlash
                  </Button>
                  <Button variant="ghost" className="hover:text-ink-red" onClick={handleDelete}>
                    <Trash2 className="size-4" strokeWidth={1.9} aria-hidden />
                    O'chirish
                  </Button>
                </>
              )}
            </div>
          )}
          <ErrorText>{move.error?.message}</ErrorText>
          {returnTo && (
            <div className="mb-4 rounded-2xl bg-tag-orange-bg/50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-800">Nima uchun qaytaryapsiz?</p>
              <ReturnForm taskId={id} to={returnTo} onDone={() => setReturnTo(null)} onCancel={() => setReturnTo(null)} />
            </div>
          )}

          <div className="border-t border-line pt-4">
            {task.description ? (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-slate-800">{task.description}</p>
            ) : (
              <p className="text-[15px] text-slate-400">Tavsif yo'q</p>
            )}
          </div>

          <section className="mt-6 border-t border-line pt-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Izohlar {task.comments.length > 0 && <span className="font-normal text-slate-400">{task.comments.length}</span>}</h2>
            <ul className="mb-3 space-y-3">
              {task.comments.map((c) => (
                <li key={c.id} className="flex gap-2">
                  <Avatar name={c.authorName} size="sm" />
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-slate-100/80 px-3 py-2">
                    <p className="text-xs">
                      <span className="font-bold text-slate-800">{firstName(c.authorName)}</span>{' '}
                      <span className="text-slate-400" title={formatDateTime(c.createdAt)}>
                        {relativeTime(c.createdAt)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm whitespace-pre-wrap text-slate-800">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <form onSubmit={handleComment} className="space-y-2">
              <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={2000} placeholder="Fikringizni yozing…" aria-label="Izoh" />
              <ErrorText>{addComment.error?.message}</ErrorText>
              {text.trim() && (
                <Button type="submit" disabled={addComment.isPending}>
                  Yuborish
                </Button>
              )}
            </form>
          </section>
        </article>
      )}
    </Modal>
  )
}
