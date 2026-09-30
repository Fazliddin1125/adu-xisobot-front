const COLORS = ['var(--color-series-1)', 'var(--color-series-2)', 'var(--color-series-3)']

export interface Part {
  label: string
  value: number
}

/** Ulushlarni ko'rsatuvchi gorizontal bo'lingan chiziq + yorliqli legenda */
export function SplitBar({ title, parts }: { title: string; parts: Part[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0)
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded bg-slate-100" role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}`).join(', ')}>
        {total > 0 &&
          parts.map((p, i) =>
            p.value ? (
              <div
                key={p.label}
                title={`${p.label}: ${p.value} (${Math.round((p.value / total) * 100)}%)`}
                style={{ width: `${(p.value / total) * 100}%`, background: COLORS[i] }}
                className="h-full first:rounded-l last:rounded-r"
              />
            ) : null,
          )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center gap-1.5 text-slate-600">
            <span className="size-2.5 rounded-sm" style={{ background: COLORS[i] }} />
            {p.label}
            <span className="tabular font-semibold text-slate-900">{p.value}</span>
            {total > 0 && <span className="text-slate-400">({Math.round((p.value / total) * 100)}%)</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
