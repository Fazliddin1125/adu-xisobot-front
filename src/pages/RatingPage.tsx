import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { useRating, type RatingRow } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import { PeriodPicker } from '../components/PeriodPicker'
import { Avatar, Card, Empty, Loading, PageHeader } from '../components/ui'
import { periodLabel } from '../lib/period'

const MEDALS = [
  { ring: 'ring-[#e9b949]', bg: 'bg-[#fff7e0]', text: 'text-[#9a6b00]', label: '1' },
  { ring: 'ring-[#b8c1cc]', bg: 'bg-[#f1f4f7]', text: 'text-[#5b6675]', label: '2' },
  { ring: 'ring-[#d69a6a]', bg: 'bg-[#fbefe5]', text: 'text-[#8a4f22]', label: '3' },
]

/** Eng ko'p ish yozgan uchtasi — shohsupa */
function Podium({ rows, meId }: { rows: RatingRow[]; meId?: string }) {
  // Ko'rinish tartibi: 2 — 1 — 3
  const order = [rows[1], rows[0], rows[2]].filter(Boolean)
  return (
    <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
      {order.map((r) => {
        const m = MEDALS[r.rank - 1] ?? MEDALS[2]
        const first = r.rank === 1
        return (
          <div
            key={r.staffId}
            className={`flex flex-col items-center rounded-xl border bg-white px-2 pb-4 text-center shadow-card ${first ? 'pt-6' : 'pt-4'} ${
              r.staffId === meId ? 'border-brand-500' : 'border-line'
            }`}
          >
            <span className={`mb-2 flex size-7 items-center justify-center rounded-full font-mono text-sm font-bold ring-2 ${m.ring} ${m.bg} ${m.text}`}>
              {m.label}
            </span>
            <Avatar name={r.fullName} size={first ? 'lg' : 'md'} />
            <p className="mt-2 line-clamp-2 text-[13px] leading-tight font-semibold text-slate-900">{r.fullName}</p>
            <p className="mt-1 font-mono text-xl font-bold text-slate-900 sm:text-2xl">{r.total}</p>
            <p className="text-[11px] text-slate-500">ta ish</p>
          </div>
        )
      })}
    </div>
  )
}

/** Xodimlar reytingi — kim ko'p ish yozgan (hamma ko'radi) */
export function RatingPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('month')
  const rating = useRating(period)
  const rows = rating.data?.rows ?? []
  const max = Math.max(1, ...rows.map((r) => r.total))
  const top = rows.filter((r) => r.total > 0).slice(0, 3)
  const mine = rows.find((r) => r.staffId === user?.id)

  return (
    <>
      <PageHeader
        icon={Trophy}
        title="Reyting"
        subtitle={`Kim ko‘p ish yozgan · ${periodLabel(period)}${mine ? ` · siz ${mine.rank}-o‘rindasiz` : ''}`}
        action={<PeriodPicker value={period} onChange={setPeriod} />}
      />
      {rating.isLoading ? (
        <Loading />
      ) : rating.isError ? (
        <Empty icon={Trophy}>{rating.error.message}</Empty>
      ) : !rows.length ? (
        <Empty icon={Trophy}>Reytingda hali hech kim yo‘q</Empty>
      ) : (
        <div className="space-y-5">
          {top.length > 0 && <Podium rows={top} meId={user?.id} />}
          <Card>
            <ol className="-my-2 divide-y divide-line">
              {rows.map((r) => (
                <li key={r.staffId} className={`flex items-center gap-3 py-2.5 ${r.staffId === user?.id ? '-mx-3 rounded-lg bg-brand-50 px-3' : ''}`}>
                  <span className="w-7 shrink-0 text-right font-mono text-sm font-semibold text-slate-400">{r.rank}</span>
                  <Avatar name={r.fullName} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {r.fullName}
                      {r.staffId === user?.id && <span className="ml-1.5 text-xs font-semibold text-brand-600">(siz)</span>}
                    </span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <span className="block h-full rounded-full bg-brand-500 transition-[width] duration-500" style={{ width: `${(r.total / max) * 100}%` }} />
                    </span>
                  </span>
                  <span className="hidden w-40 truncate text-xs text-slate-500 md:block">{r.departmentName ?? "Bo'limsiz"}</span>
                  <span className="w-12 shrink-0 text-right font-mono text-sm font-bold text-slate-900">{r.total}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </>
  )
}
