import { CircleCheck, CircleX } from 'lucide-react'
import type { DeliveryResult } from '../api/types'

/** Kimga yetib bordi (yashil) / bormadi (qizil, sababi bilan) */
export function DeliveryResults({ results }: { results: DeliveryResult[] }) {
  const failed = results.filter((r) => !r.ok)
  const ok = results.filter((r) => r.ok)
  return (
    <div className="space-y-3 text-sm">
      {failed.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-ink-red">Yetib bormadi · {failed.length}</p>
          <ul className="space-y-1">
            {failed.map((r) => (
              <li key={r.userId} className="flex items-start gap-1.5">
                <CircleX className="mt-0.5 size-4 shrink-0 text-ink-red" strokeWidth={2} aria-hidden />
                <span>
                  <span className="font-medium text-slate-800">{r.fullName}</span> <span className="text-slate-500">— {r.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {ok.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-ink-green">Yetib bordi · {ok.length}</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {ok.map((r) => (
              <li key={r.userId} className="flex items-center gap-1 text-slate-700">
                <CircleCheck className="size-3.5 text-ink-green" strokeWidth={2.2} aria-hidden />
                {r.fullName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
