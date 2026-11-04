import { CheckCircle2, ExternalLink, PenLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppeals, useCreateAppeal } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import { AppealForm } from '../components/AppealForm'
import { useToast } from '../components/Toast'
import { formatTime } from '../lib/period'
import { haptic } from '../lib/telegram'
import { ThemeButton } from '../components/ThemeToggle'

/**
 * Bot ichida ochiladigan ixcham sahifa (Telegram WebApp): ish yozish va bugungi ishlar.
 * Menyusiz, telefon ekraniga moslangan.
 */
export function TgWritePage() {
  const { user } = useAuth()
  const create = useCreateAppeal()
  const today = useAppeals('today', { staffId: user?.id })
  const toast = useToast()
  const list = today.data ?? []

  return (
    <div className="tech-bg min-h-dvh px-4 pt-5 pb-10">
      <div className="mx-auto max-w-lg">
        <header className="mb-4 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface text-brand-600 shadow-card">
            <PenLine className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg leading-tight font-semibold text-slate-900">Ish yozish</h1>
            <p className="truncate text-xs text-slate-500">{user?.fullName}</p>
          </div>
          <ThemeButton className="ml-auto" />
          <span className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-xs text-slate-600">
            Bugun: <b className="text-slate-900">{list.length}</b>
          </span>
        </header>

        <section className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <AppealForm
            submitLabel="Saqlash"
            resetOnSuccess
            submitting={create.isPending}
            error={create.error?.message}
            onSubmit={async (input) => {
              try {
                await create.mutateAsync(input)
                haptic('success')
                toast.success('Ish saqlandi. Rahmat!')
              } catch (e) {
                haptic('error')
                throw e
              }
            }}
          />
        </section>

        <section className="mt-4 rounded-xl border border-line bg-surface shadow-card">
          <h2 className="border-b border-line px-4 py-2.5 text-[13px] font-semibold text-slate-700">Bugungi ishlarim</h2>
          {!list.length ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">Bugun hali ish yozilmagan</p>
          ) : (
            <ul className="divide-y divide-line">
              {list.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 px-4 py-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ink-green" strokeWidth={2} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate-800">{a.title}</span>
                    {a.comment && <span className="block text-xs text-slate-500">{a.comment}</span>}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{formatTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link to="/" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600">
          Saytni to‘liq ochish
          <ExternalLink className="size-3.5" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
