import { Link } from 'react-router-dom'
import type { Appeal, StaffRow } from '../api/types'
import { formatTime } from '../lib/period'
import { Avatar, Badge, Empty } from './ui'

/**
 * Bitta kun uchun: har bir xodim nechta ish yozgani va yozgan matnlari.
 * Ish yozmaganlar oxirida qizil belgi bilan (bo'lim boshliqlari — oddiy kulrang).
 */
export function DayBreakdown({ staff, appeals }: { staff: StaffRow[]; appeals: Appeal[] }) {
  const byStaff = new Map<string, Appeal[]>()
  for (const a of appeals) byStaff.set(a.staffId, [...(byStaff.get(a.staffId) ?? []), a])
  const rows = [...staff].sort((a, b) => (byStaff.get(b.staffId)?.length ?? 0) - (byStaff.get(a.staffId)?.length ?? 0) || a.fullName.localeCompare(b.fullName))
  if (!rows.length) return <Empty>Xodim topilmadi</Empty>

  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => {
        const list = (byStaff.get(r.staffId) ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        return (
          <li key={r.staffId} className="py-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={r.fullName} size="sm" />
              <Link to={`/xodimlar/${r.staffId}`} className="min-w-0 flex-1 truncate font-semibold text-slate-800 hover:text-brand-600">
                {r.fullName}
                <span className="ml-1.5 text-xs font-normal text-slate-500">{r.departmentName ?? "Bo'limsiz"}</span>
              </Link>
              {list.length ? (
                <Badge tone="green">{list.length} ta ish</Badge>
              ) : (
                <Badge tone={r.role === 'xodim' ? 'red' : 'slate'}>Ish yozmagan</Badge>
              )}
            </div>
            {list.length > 0 && (
              <ol className="mt-2 ml-9 space-y-1.5">
                {list.map((a, i) => (
                  <li key={a.id} className="text-sm">
                    <span className="tabular mr-1.5 text-xs text-slate-400">
                      {i + 1}. {formatTime(a.createdAt)}
                    </span>
                    <span className="text-slate-800">{a.title}</span>
                    {a.comment && <p className="mt-0.5 text-[13px] whitespace-pre-wrap text-slate-500">{a.comment}</p>}
                  </li>
                ))}
              </ol>
            )}
          </li>
        )
      })}
    </ul>
  )
}
