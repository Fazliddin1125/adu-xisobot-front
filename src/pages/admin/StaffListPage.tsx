import { useMemo, useState } from 'react'
import { ChevronRight, SearchX, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStaffStats, useWorkload } from '../../api/hooks'
import type { StaffRow, WorkloadRow } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { PeriodPicker } from '../../components/PeriodPicker'
import { Avatar, Badge, Card, Empty, Input, Loading, PageHeader, Segmented } from '../../components/ui'
import { periodLabel } from '../../lib/period'
import { ROLE_LABELS } from '../../lib/roles'

/** Bo'sh / Band · N (muddati o'tgan bo'lsa qizil) */
function WorkloadChip({ row }: { row?: WorkloadRow }) {
  if (!row) return null
  if (!row.activeCount) return <Badge tone="green">Bo‘sh</Badge>
  return <Badge tone={row.overdueCount ? 'red' : 'blue'}>Band · {row.activeCount}</Badge>
}

/** Rahbarlar uchun: barcha xodimlar bo'limlar bo'yicha; bosilsa xodimning ishlari ochiladi */
export function StaffListPage() {
  const { user: me } = useAuth()
  const [period, setPeriod] = useState('month')
  const [search, setSearch] = useState('')
  const staff = useStaffStats(period)
  const workload = useWorkload()
  const [show, setShow] = useState<'all' | 'free' | 'busy'>('all')
  const busy = useMemo(() => new Map((workload.data ?? []).map((w) => [w.userId, w])), [workload.data])
  const freeCount = (workload.data ?? []).filter((w) => w.activeCount === 0).length
  const busyCount = (workload.data ?? []).length - freeCount

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const active = (id: string) => busy.get(id)?.activeCount ?? 0
    const rows = (staff.data?.rows ?? [])
      .filter((r) => !q || r.fullName.toLowerCase().includes(q))
      .filter((r) => show === 'all' || (show === 'free' ? active(r.staffId) === 0 : active(r.staffId) > 0))
    const byDept = new Map<string, { name: string; mine: boolean; rows: StaffRow[] }>()
    for (const r of rows) {
      const key = r.departmentId ?? ''
      const g = byDept.get(key) ?? { name: r.departmentName ?? "Bo'limsiz", mine: !!key && key === me?.departmentId, rows: [] }
      g.rows.push(r)
      byDept.set(key, g)
    }
    const rank = (key: string, mine: boolean) => (mine ? 0 : key ? 1 : 2)
    return [...byDept.entries()]
      .map(([key, g]) => ({ key, ...g, rows: g.rows.sort((a, b) => a.fullName.localeCompare(b.fullName)) }))
      .sort((a, b) => rank(a.key, a.mine) - rank(b.key, b.mine) || a.name.localeCompare(b.name))
  }, [staff.data, search, me, show, busy])

  return (
    <>
      <PageHeader
        icon={UsersRound}
        title="Xodimlar"
        subtitle={`Kim bo‘sh, kim band — topshiriq berishdan oldin ko‘ring · ${periodLabel(period)}`}
        action={<PeriodPicker value={period} onChange={setPeriod} />}
      />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="sm:w-72">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism bo'yicha qidirish…" aria-label="Xodimni qidirish" />
        </div>
        {/* Bandlik: faol (yangi/jarayonda) topshiriqlari bor-yo'qligi bo'yicha */}
        <Segmented
          label="Bandlik"
          options={[
            { value: 'all', label: 'Hammasi' },
            { value: 'free', label: `Bo‘sh · ${freeCount}` },
            { value: 'busy', label: `Band · ${busyCount}` },
          ]}
          value={show}
          onChange={setShow}
        />
      </div>

      {staff.isLoading ? (
        <Loading />
      ) : !groups.length ? (
        <Empty icon={SearchX}>Xodim topilmadi</Empty>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <Card key={g.key || 'none'} title={g.name} subtitle={`${g.rows.length} xodim${g.mine ? " · mening bo'limim" : ''}`}>
              <ul className="-mx-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {g.rows.map((r) => (
                  <li key={r.staffId}>
                    <Link to={`/xodimlar/${r.staffId}`} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-hover">
                      <Avatar name={r.fullName} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-slate-800">{r.fullName}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {ROLE_LABELS[r.role]} · {r.total} ta ish
                        </span>
                        {/* Hozir qaysi topshiriqlar ustida ishlayapti */}
                        {busy.get(r.staffId)?.tasks.slice(0, 2).map((t) => (
                          <span key={t.id} className={`block truncate text-xs ${t.overdue ? 'text-ink-red' : 'text-slate-400'}`}>
                            • {t.title}
                          </span>
                        ))}
                      </span>
                      <WorkloadChip row={busy.get(r.staffId)} />
                      <ChevronRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
