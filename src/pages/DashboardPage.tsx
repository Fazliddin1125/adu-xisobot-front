import { ArrowRight, Coffee, PartyPopper } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppeals, useCreateAppeal, useSummary, useTasks } from '../api/hooks'
import type { Task } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { AppealForm } from '../components/AppealForm'
import { AppealTable } from '../components/AppealTable'
import { useToast } from '../components/Toast'
import { DeadlineChip } from '../components/tasks/DeadlineChip'
import { TaskDetail } from '../components/tasks/TaskDetail'
import { Avatar, Badge, Card, Empty, Loading } from '../components/ui'
import { deadlineText, firstName, greeting, longDate } from '../lib/humanize'
import { TASK_COLUMN } from '../lib/tasks'

/** Kun holatini bir-ikki jumlada, odamcha aytib beradi */
function daySummary(todayCount: number | undefined, tasks: Task[]): string {
  const parts: string[] = []
  if (todayCount === undefined) return ''
  parts.push(todayCount === 0 ? 'Bugun hali murojaat bo\'lmadi — tinch kun.' : `Bugun ${todayCount} ta murojaatga yordam berdingiz. Barakalla!`)
  const late = tasks.filter((t) => deadlineText(t.deadline, false).tone === 'late').length
  const soon = tasks.filter((t) => deadlineText(t.deadline, false).tone === 'soon').length
  if (late) parts.push(`${late} ta topshiriqning muddati o'tib ketgan, ularga e'tibor bering.`)
  else if (soon) parts.push(`${soon} ta topshiriqning muddati yaqin.`)
  else if (tasks.length) parts.push(`Sizni ${tasks.length} ta topshiriq kutmoqda.`)
  return parts.join(' ')
}

function HeroStat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-2xl bg-white/70 px-4 py-2.5 backdrop-blur">
      <p className="tabular text-2xl leading-tight font-extrabold text-slate-800">{value ?? '–'}</p>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const toast = useToast()
  const summary = useSummary()
  const today = useAppeals('today', { staffId: user?.id })
  const tasks = useTasks({ scope: 'mine' })
  const create = useCreateAppeal()
  const [openTask, setOpenTask] = useState<string | null>(null)
  const myActive = (tasks.data ?? []).filter((t) => t.status !== 'bajarildi' && t.assignees.some((a) => a.id === user?.id))

  return (
    <>
      <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-[#f6f1ff] to-[#fff1e6] p-6 sm:p-8">
        <p className="text-sm font-semibold text-slate-500">{longDate()}</p>
        <h1 className="mt-1 text-[26px] leading-tight font-extrabold tracking-[-0.02em] text-slate-800 sm:text-[32px]">
          {greeting()}, {user ? firstName(user.fullName) : ''}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] text-slate-600">{daySummary(today.data?.length, myActive)}</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <HeroStat label="bugun" value={summary.data?.today} />
          <HeroStat label="shu hafta" value={summary.data?.week} />
          <HeroStat label="shu oy" value={summary.data?.month} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Yangi murojaat" subtitle="Bir necha soniyada qayd eting" className="lg:col-span-2">
          <AppealForm
            submitLabel="Saqlash"
            resetOnSuccess
            submitting={create.isPending}
            error={create.error?.message}
            onSubmit={async (input) => {
              await create.mutateAsync(input)
              toast.success('Murojaat saqlandi. Rahmat!')
            }}
          />
        </Card>

        <Card title="Bugun qabul qilganlarim" subtitle={today.data?.length ? `${today.data.length} ta murojaat` : undefined} className="lg:col-span-3">
          {today.isLoading ? (
            <Loading />
          ) : !today.data?.length ? (
            <Empty icon={Coffee} hint="Kimdir murojaat qilsa, chapdagi formadan qayd eting">
              Bugun hali murojaat yo'q
            </Empty>
          ) : (
            <AppealTable appeals={today.data} compact />
          )}
        </Card>
      </div>

      <Card
        title="Sizni kutayotgan topshiriqlar"
        subtitle={myActive.length ? `${myActive.length} ta faol` : undefined}
        className="mt-6"
        action={
          <Link to="/topshiriqlar" className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-brand-600 hover:bg-brand-50">
            Doskani ochish
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </Link>
        }
      >
        {tasks.isLoading ? (
          <Loading />
        ) : !myActive.length ? (
          <Empty icon={PartyPopper} hint="Yangi topshiriq berilsa, shu yerda ko'rinadi">
            Hamma ishlar bajarilgan
          </Empty>
        ) : (
          <ul className="-mx-2 space-y-1">
            {myActive.slice(0, 6).map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => setOpenTask(t.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-hover">
                  <Avatar name={t.creator.fullName} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-800">{t.title}</span>
                    <span className="block truncate text-xs text-slate-500">Muallif: {firstName(t.creator.fullName)}</span>
                  </span>
                  <span className="hidden gap-1.5 sm:flex">
                    <Badge tone={TASK_COLUMN[t.status].tone}>{TASK_COLUMN[t.status].label}</Badge>
                  </span>
                  <DeadlineChip deadline={t.deadline} done={false} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {openTask && <TaskDetail id={openTask} onClose={() => setOpenTask(null)} />}
    </>
  )
}
