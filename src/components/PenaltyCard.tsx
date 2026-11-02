import { ShieldAlert } from 'lucide-react'
import { useRemovePenalty, useUserPenalties } from '../api/hooks'
import { useToast } from './Toast'
import { Badge, Button, Card, Loading } from './ui'

const fmt = (key: string) => key.split('-').reverse().join('.')

/** Rahbarlar: xodimning jarima ballari (ish yozilmagan kunlar). Uzrli bo'lsa bekor qilinadi */
export function PenaltyCard({ userId }: { userId: string }) {
  const penalties = useUserPenalties(userId)
  const remove = useRemovePenalty()
  const toast = useToast()
  const data = penalties.data

  async function cancel(id: string, day: string) {
    if (!confirm(`${fmt(day)} kungi jarimani bekor qilasizmi? (masalan, uzrli sabab bo'lsa)`)) return
    await remove.mutateAsync(id)
    toast.success('Jarima bekor qilindi')
  }

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-slate-400" strokeWidth={1.9} aria-hidden />
          Jarima ballari
          {data && <Badge tone={data.total < 0 ? 'red' : 'green'}>{data.total < 0 ? `${data.total} ball` : 'Jarima yo‘q'}</Badge>}
        </span>
      }
      subtitle="Ish yozilmagan har bir kun uchun −1 ball (yakshanba va ta’til kunlari hisobga olinmaydi)"
    >
      {penalties.isLoading ? (
        <Loading />
      ) : !data?.items.length ? (
        <p className="text-sm text-slate-500">Hammasi joyida — ish yozilmagan kun yo‘q.</p>
      ) : (
        <ul className="divide-y divide-line">
          {data.items.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                <span className="font-semibold text-slate-800">{fmt(p.day)}</span> <span className="text-slate-500">— {p.reason}</span>
              </span>
              <span className="flex items-center gap-2">
                <Badge tone="red">{p.points}</Badge>
                <Button variant="ghost" className="h-7 px-2 text-xs" disabled={remove.isPending} onClick={() => cancel(p.id, p.day)}>
                  Bekor qilish
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
