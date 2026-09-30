import type { ReactNode } from 'react'

/** Notion "callout" bloki uslubidagi ko'rsatkich */
export function StatCard({ label, value, hint, accent, icon }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean; icon?: string }) {
  return (
    <div className={`rounded-2xl px-4 py-3.5 ${accent ? 'bg-brand-50' : 'bg-white shadow-soft'}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {icon && <span aria-hidden>{icon}</span>}
        {label}
      </p>
      <p className="tabular mt-0.5 text-[28px] leading-tight font-extrabold text-slate-800">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
