import { Hand, Inbox } from 'lucide-react'
import { useClaimTask } from '../../api/hooks'
import type { Task } from '../../api/types'
import { firstName } from '../../lib/humanize'
import { useToast } from '../Toast'
import { Button, Card } from '../ui'
import { DeadlineChip } from './DeadlineChip'

/**
 * Egasi yo'q umumiy ishlar — har qanday xodim "Qabul qilish"ni bosib o'z zimmasiga oladi.
 * Ro'yxat bo'sh bo'lsa hech narsa ko'rsatilmaydi.
 */
export function CommonTasks({ tasks, onOpen, compact }: { tasks: Task[]; onOpen: (id: string) => void; compact?: boolean }) {
  const claim = useClaimTask()
  const toast = useToast()
  if (!tasks.length) return null

  async function handleClaim(t: Task) {
    try {
      await claim.mutateAsync(t.id)
      toast.success(`"${t.title}" endi sizning zimmangizda`)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const list = compact ? tasks.slice(0, 4) : tasks
  return (
    <Card
      title={
        <span className="inline-flex items-center gap-2">
          <Inbox className="size-4 text-tag-orange" strokeWidth={2} aria-hidden />
          Umumiy ishlar · {tasks.length}
        </span>
      }
      subtitle="Egasi yo‘q — kim qabul qilsa, o‘sha bajaradi"
      className="mb-5 ring-1 ring-tag-orange-bg"
    >
      <ul className="-mx-2 space-y-1">
        {list.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-hover">
            <button type="button" onClick={() => onOpen(t.id)} className="min-w-0 flex-1 text-left">
              <span className="block font-semibold break-words text-slate-800">{t.title}</span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <DeadlineChip deadline={t.deadline} done={false} />
                Muallif: {firstName(t.creator.fullName)}
              </span>
            </button>
            <Button className="w-full sm:w-auto" onClick={() => handleClaim(t)} disabled={claim.isPending}>
              <Hand className="size-4" strokeWidth={2} aria-hidden />
              Ishni qabul qilish
            </Button>
          </li>
        ))}
      </ul>
      {compact && tasks.length > list.length && <p className="mt-2 px-2 text-xs text-slate-400">Yana {tasks.length - list.length} ta — Topshiriqlar sahifasida</p>}
    </Card>
  )
}
