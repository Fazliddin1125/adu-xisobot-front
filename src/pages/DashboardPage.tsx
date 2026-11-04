import { ArrowRight, Coffee, PartyPopper } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppeals, useCreateAppeal, useMyPenalties, useSummary, useTasks } from '../api/hooks'
import type { Task } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { AppealForm } from '../components/AppealForm'
import { AppealTable } from '../components/AppealTable'
import { useToast } from '../components/Toast'
import { DeadlineChip } from '../components/tasks/DeadlineChip'
import { CommonTasks } from '../components/tasks/CommonTasks'
import { QuickStatusButton } from '../components/tasks/QuickStatusButton'
import { TaskDetail } from '../components/tasks/TaskDetail'
import { Avatar, Badge, Card, Empty, Loading } from '../components/ui'
import { deadlineText, firstName, greeting, longDate } from '../lib/humanize'
import { TASK_COLUMN } from '../lib/tasks'

/** Kun holatini bir-ikki jumlada, odamcha aytib beradi */
function daySummary(todayCount: number | undefined, tasks: Task[]): string {
  const parts: string[] = []
  if (todayCount === undefined) return ''
  parts.push(todayCount === 0 ? 'Bugun hali ish qayd etilmadi — tinch kun.' : `Bugun ${todayCount} ta ish bajardingiz. Barakalla!`)
  const late = tasks.filter((t) => deadlineText(t.deadline, false).tone === 'late').length
  const soon = tasks.filter((t) => deadlineText(t.deadline, false).tone === 'soon').length
  if (late) parts.push(`${late} ta topshiriqning muddati o'tib ketgan, ularga e'tibor bering.`)
  else if (soon) parts.push(`${soon} ta topshiriqning muddati yaqin.`)
  else if (tasks.length) parts.push(`Sizni ${tasks.length} ta topshiriq kutmoqda.`)
  return parts.join(' ')
}

function HeroStat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-lg border sm:min-w-28 border-white/10 bg-white/[0.04] px-4 py-2.5 backdrop-blur">
      <p className="font-mono text-2xl leading-tight font-semibold text-white">{value ?? '–'}</p>
      <p className="font-mono text-[11px] tracking-wide text-slate-400 uppercase">{label}</p>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const toast = useToast()
  const summary = useSummary()
  const today = useAppeals('today', { staffId: user?.id })
  const tasks = useTasks({ scope: 'mine' })
  const common = useTasks({ scope: 'common' })
  const create = useCreateAppeal()
  const penalties = useMyPenalties()
  const [openTask, setOpenTask] = useState<string | null>(null)
  const myActive = (tasks.data ?? []).filter((t) => t.status !== 'bajarildi' && t.assignees.some((a) => a.id === user?.id))

  return (
    <>
      <section className="tech-panel mb-6 rounded-2xl p-5 sm:p-7">
        <p className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="live-dot size-1.5 rounded-full bg-emerald-400" aria-hidden />
          {longDate()}
        </p>
        <h1 className="mt-2 text-[24px] leading-tight font-semibold tracking-[-0.02em] text-white sm:text-[30px]">
          {greeting()}, {user ? firstName(user.fullName) : ''}
        </h1>
        <p className="mt-2 max-w-xl text-[14px] text-slate-300">{daySummary(today.data?.length, myActive)}</p>
        {(penalties.data?.total ?? 0) < 0 && (
          <p className="mt-3 inline-flex rounded-md border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-200">
            Jarima ballaringiz: <b className="mx-1 font-mono text-red-300">{penalties.data!.total}</b>
            {penalties.data!.items[0] && <>· oxirgisi {penalties.data!.items[0].day.split('-').reverse().join('.')}</>}
          </p>
        )}
        <div className="mt-5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
          <HeroStat label="bugun" value={summary.data?.today} />
          <HeroStat label="shu hafta" value={summary.data?.week} />
          <HeroStat label="shu oy" value={summary.data?.month} />
        </div>
      </section>

      <CommonTasks tasks={common.data ?? []} onOpen={setOpenTask} compact />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Yangi ish" subtitle="Bajarilgan ishni bir necha soniyada qayd eting" className="lg:col-span-2">
          <AppealForm
            submitLabel="Saqlash"
            resetOnSuccess
            submitting={create.isPending}
            error={create.error?.message}
            onSubmit={async (input) => {
              await create.mutateAsync(input)
              toast.success('Ish saqlandi. Rahmat!')
            }}
          />
        </Card>

        <Card title="Bugun bajarganlarim" subtitle={today.data?.length ? `${today.data.length} ta ish` : undefined} className="lg:col-span-3">
          {today.isLoading ? (
            <Loading />
          ) : !today.data?.length ? (
            <Empty icon={Coffee} hint="Biror ish bajarsangiz, «Yangi ish» formasidan qayd eting">
              Bugun hali ish qayd etilmagan
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
          <Link to="/topshiriqlar" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium text-brand-600 hover:bg-brand-50">
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
              <li key={t.id} className="flex flex-col gap-2 rounded-xl transition hover:bg-hover sm:flex-row sm:items-center sm:pr-2">
                <button type="button" onClick={() => setOpenTask(t.id)} className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2.5 text-left">
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
                <QuickStatusButton task={t} className="mx-2 mb-2 sm:m-0 sm:w-40" />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {openTask && <TaskDetail id={openTask} onClose={() => setOpenTask(null)} />}
    </>
  )
}
