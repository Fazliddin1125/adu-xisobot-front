import { CircleCheck, Play } from 'lucide-react'
import { useMoveTask } from '../../api/hooks'
import type { Task, TaskStatus } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { useToast } from '../Toast'
import { Button, cx } from '../ui'

/** Ijrochi uchun keyingi qadam: Yangi → "Ishni boshladim", Jarayonda → "Bajarildi" */
const NEXT: Partial<Record<TaskStatus, { to: TaskStatus; label: string; done: string }>> = {
  yangi: { to: 'jarayonda', label: 'Ishni boshladim', done: 'Ish boshlandi — "Jarayonda"ga o‘tdi' },
  jarayonda: { to: 'bajarildi', label: 'Bajarildi', done: 'Ajoyib! Topshiriq bajarildi' },
}

/**
 * Telefondan sudramasdan bir bosishda keyingi bosqichga o'tkazish.
 * Faqat topshiriq ijrochisiga va server ruxsat bergan bo'lsa ko'rinadi.
 */
export function QuickStatusButton({ task, className }: { task: Task; className?: string }) {
  const { user } = useAuth()
  const move = useMoveTask()
  const toast = useToast()
  const next = NEXT[task.status]
  const mine = task.assignees.some((a) => a.id === user?.id)
  if (!next || !mine || !task.allowedStatuses.includes(next.to)) return null

  const Icon = next.to === 'bajarildi' ? CircleCheck : Play
  return (
    <Button
      variant={next.to === 'bajarildi' ? 'primary' : 'secondary'}
      className={cx('h-10', className)}
      disabled={move.isPending}
      // Kartochka ochilmasin va sudrash boshlanmasin
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        move.mutate(
          { id: task.id, status: next.to },
          { onSuccess: () => toast.success(next.done), onError: (err) => toast.error(err.message) },
        )
      }}
    >
      <Icon className="size-4" strokeWidth={2.2} aria-hidden />
      {next.label}
    </Button>
  )
}
