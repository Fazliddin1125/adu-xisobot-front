import { useState, type FormEvent } from 'react'
import { Undo2 } from 'lucide-react'
import { useMoveTask } from '../../api/hooks'
import type { TaskStatus } from '../../api/types'
import { TASK_COLUMN } from '../../lib/tasks'
import { useToast } from '../Toast'
import { Button, ErrorText, Textarea } from '../ui'

/** Bajarilgan topshiriqni izoh bilan orqaga qaytarish. Izoh ijrochiga bot orqali ham boradi */
export function ReturnForm({ taskId, to = 'jarayonda', onDone, onCancel }: { taskId: string; to?: TaskStatus; onDone: () => void; onCancel: () => void }) {
  const move = useMoveTask()
  const toast = useToast()
  const [comment, setComment] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await move.mutateAsync({ id: taskId, status: to, comment: comment.trim() })
      toast.success(`Topshiriq "${TASK_COLUMN[to].label}" bosqichiga qaytarildi, ijrochiga xabar yuborildi`)
      onDone()
    } catch {
      // xato matni pastda ko'rsatiladi
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={2000}
        autoFocus
        placeholder="Nima qayta ishlanishi kerak? Masalan: hisobotda mart oyi yo'q"
        aria-label="Qaytarish sababi"
      />
      <p className="text-xs text-slate-500">Izoh topshiriqqa yoziladi va ijrochilarga Telegram bot orqali yuboriladi.</p>
      <ErrorText>{move.error?.message}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" disabled={move.isPending || comment.trim().length < 3}>
          <Undo2 className="size-4" strokeWidth={2} aria-hidden />
          Qaytarish
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Bekor qilish
        </Button>
      </div>
    </form>
  )
}
