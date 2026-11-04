import type { ReactNode } from 'react'

/** Ko'rsatkich kartochkasi: kichik yorliq va katta monospace raqam */
export function StatCard({ label, value, hint, accent, icon }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean; icon?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl px-4 py-3.5 shadow-card ${accent ? 'bg-brand-50/60' : 'bg-white'}`}>
      {accent && <span className="absolute inset-x-0 top-0 h-0.5 bg-brand-600" aria-hidden />}
      <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
        {icon && <span aria-hidden>{icon}</span>}
        {label}
      </p>
      <p className="mt-1 font-mono text-[26px] leading-tight font-semibold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
