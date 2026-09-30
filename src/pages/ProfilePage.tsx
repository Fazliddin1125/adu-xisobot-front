import { Check, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useChangePassword, useDepartments } from '../api/hooks'
import { ROLE_LABELS } from '../lib/roles'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, ErrorText, Field, Input, PageHeader } from '../components/ui'

export function ProfilePage() {
  const { user } = useAuth()
  const change = useChangePassword()
  const departments = useDepartments()
  const [currentPassword, setCurrent] = useState('')
  const [newPassword, setNew] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setDone(false)
    if (newPassword !== repeat) return setError('Yangi parollar mos kelmadi')
    try {
      await change.mutateAsync({ currentPassword, newPassword })
      setCurrent('')
      setNew('')
      setRepeat('')
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      <PageHeader icon={UserRound} title="Profil" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Ma'lumotlar">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">F.I.Sh</dt>
              <dd className="font-medium text-slate-900">{user?.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Login</dt>
              <dd className="font-medium text-slate-900">{user?.username}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Rol</dt>
              <dd className="font-medium text-slate-900">{user && ROLE_LABELS[user.role]}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Telegram</dt>
              <dd className="font-medium text-slate-900">
                {user?.telegramId ? `Ulangan (ID ${user.telegramId})` : "Ulanmagan — botga /start bosing va ID ni administratorga yuboring"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Bo'lim</dt>
              <dd className="font-medium text-slate-900">{departments.data?.find((d) => d.id === user?.departmentId)?.name ?? "Bo'limsiz"}</dd>
            </div>
          </dl>
        </Card>
        <Card title="Parolni o'zgartirish">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Joriy parol">
              <Input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
            </Field>
            <Field label="Yangi parol" hint="kamida 6 belgi">
              <Input type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} minLength={6} autoComplete="new-password" required />
            </Field>
            <Field label="Yangi parolni takrorlang">
              <Input type="password" value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete="new-password" required />
            </Field>
            <ErrorText>{error}</ErrorText>
            {done && (
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-good-ink">
                <Check className="size-4" strokeWidth={2.5} aria-hidden />
                Parol o'zgartirildi
              </p>
            )}
            <Button type="submit" disabled={change.isPending}>
              Saqlash
            </Button>
          </form>
        </Card>
      </div>
    </>
  )
}
