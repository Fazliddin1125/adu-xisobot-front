import { useState, type FormEvent } from 'react'
import { TreePalm } from 'lucide-react'
import { useSetVacation } from '../api/hooks'
import type { User } from '../api/types'
import { todayInput } from '../lib/tasks'
import { useToast } from './Toast'
import { Badge, Button, Card, ErrorText, Field, Input } from './ui'

const fmt = (key: string) => key.split('-').reverse().join('.')

/**
 * Rahbarlar: xodimni ta'tilga chiqarish. Ta'tildagiga topshiriq berish mumkin,
 * lekin u kunlik hisobotdagi "ish yozmaganlar" ro'yxatiga tushmaydi.
 */
export function VacationCard({ user }: { user: User }) {
  const setVacation = useSetVacation()
  const toast = useToast()
  const today = todayInput()
  const [editing, setEditing] = useState(false)
  const [from, setFrom] = useState(user.vacationFrom ?? today)
  const [to, setTo] = useState(user.vacationTo ?? today)

  const planned = !!user.vacationTo && user.vacationTo >= today
  const current = planned && user.vacationFrom! <= today

  async function save(e: FormEvent) {
    e.preventDefault()
    await setVacation.mutateAsync({ id: user.id, vacation: { from, to } })
    toast.success(`Ta'til saqlandi: ${fmt(from)} – ${fmt(to)}`)
    setEditing(false)
  }

  async function end() {
    if (!confirm("Ta'tilni bekor qilasizmi?")) return
    await setVacation.mutateAsync({ id: user.id, vacation: null })
    toast.success("Ta'til bekor qilindi")
  }

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <TreePalm className="size-4 text-slate-400" strokeWidth={1.9} aria-hidden />
          Ta'til
          {current ? <Badge tone="orange">Hozir ta'tilda</Badge> : planned && <Badge tone="purple">Rejalashtirilgan</Badge>}
        </span>
      }
      action={
        !editing && (
          <div className="flex gap-2">
            {planned && (
              <Button variant="ghost" onClick={end} disabled={setVacation.isPending}>
                Bekor qilish
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEditing(true)}>
              {planned ? "O'zgartirish" : "Ta'tilga chiqarish"}
            </Button>
          </div>
        )
      }
    >
      <div>
        {editing ? (
          <form onSubmit={save} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Boshlanishi">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
              </Field>
              <Field label="Tugashi (shu kun ham ta'til)">
                <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} required />
              </Field>
            </div>
            <ErrorText>{setVacation.error?.message}</ErrorText>
            <div className="flex gap-2">
              <Button type="submit" disabled={setVacation.isPending}>
                Saqlash
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Bekor
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500">
            {planned
              ? `${fmt(user.vacationFrom!)} – ${fmt(user.vacationTo!)}. Shu kunlarda topshiriq berish mumkin, lekin ish yozmasa kunlik hisobotda ogohlantirilmaydi.`
              : "Ta'tilda emas. Ta'tilga chiqarilsa, ish yozmagan kunlari kunlik hisobotda «ish yozmaganlar» qatoriga tushmaydi."}
          </p>
        )}
      </div>
    </Card>
  )
}
