import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'
import { avatarColors } from '../lib/humanize'
import { initials } from '../lib/tasks'

export const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(' ')

/** Oq, yumaloq blok — mayin soya bilan */
export function Card({ title, subtitle, action, children, className }: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('min-w-0 rounded-2xl bg-white shadow-soft', className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4 pb-1">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="px-5 pt-2 pb-5">{children}</div>
    </section>
  )
}

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_1px_2px_rgba(62,76,201,0.3)] active:scale-[0.98] disabled:opacity-50',
  secondary: 'border border-line-strong bg-white text-slate-800 hover:bg-hover disabled:opacity-50',
  danger: 'bg-ink-red text-white hover:brightness-95 disabled:opacity-50',
  ghost: 'text-slate-500 hover:bg-hover hover:text-slate-800 disabled:opacity-50',
}

export function Button({ variant = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-slate-700">
        {label}
        {hint && <span className="font-normal text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-line-strong bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition ' +
  'focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15'

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input className={inputCls} {...props} />
export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className={cx(inputCls, 'resize-y')} rows={3} {...props} />
export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => <select className={cx(inputCls, 'h-9 py-0 pr-8', className)} {...props} />

export interface Option<T extends string> {
  value: T
  label: string
}

/** Tugmalar ko'rinishidagi tanlov (radio guruh) */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  label,
}: {
  options: Option<T>[]
  value: T | null
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  label?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'flex-1 rounded-lg font-semibold whitespace-nowrap transition sm:flex-none',
            size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1.5 text-sm',
            value === o.value ? 'bg-white text-brand-700 shadow-card' : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export type Tone = 'slate' | 'blue' | 'green' | 'red' | 'amber' | 'orange' | 'purple'
const TONES: Record<Tone, string> = {
  slate: 'bg-tag-gray-bg text-tag-gray',
  blue: 'bg-tag-blue-bg text-tag-blue',
  green: 'bg-tag-green-bg text-tag-green',
  red: 'bg-tag-red-bg text-tag-red',
  amber: 'bg-tag-yellow-bg text-tag-yellow',
  orange: 'bg-tag-orange-bg text-tag-orange',
  purple: 'bg-tag-purple-bg text-tag-purple',
}

/** Yumaloq rangli teg */
export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx('inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap', TONES[tone])}>{children}</span>
}

/** Ismga qarab rangi doim bir xil bo'ladigan avatar */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const { bg, fg } = avatarColors(name)
  const cls = { sm: 'size-6 text-[10px]', md: 'size-8 text-xs', lg: 'size-11 text-sm' }[size]
  return (
    <span title={name} style={{ background: bg, color: fg }} className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-bold', cls)}>
      {initials(name)}
    </span>
  )
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-xl bg-tag-red-bg/70 px-3.5 py-2.5 text-sm text-tag-red">
      {children}
    </p>
  )
}

export function Loading() {
  return <p className="py-8 text-center text-sm text-slate-400">Yuklanmoqda…</p>
}

/** Bo'sh holat: ikonka + iliq matn */
export function Empty({ icon: Icon = Inbox, children, hint }: { icon?: LucideIcon; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400" aria-hidden>
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <p className="text-sm font-semibold text-slate-600">{children}</p>
      {hint && <p className="mt-0.5 max-w-xs text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

/** Sahifa sarlavhasi: yumshoq ikonka, sarlavha va qisqa izoh */
export function PageHeader({ icon: Icon, title, subtitle, action }: { icon?: LucideIcon; title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3.5">
        {Icon && (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft" aria-hidden>
            <Icon className="size-6" strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight font-extrabold tracking-[-0.02em] text-slate-800 sm:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

/** Notion sahifasidagi xususiyat qatori: chapda kulrang nom, o'ngda qiymat */
export function Property({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[34px] items-start gap-1 text-sm">
      <div className="flex w-36 shrink-0 items-center gap-2 py-1.5 text-slate-500">
        <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        {label}
      </div>
      <div className="min-w-0 flex-1 py-1.5 text-slate-800">{children}</div>
    </div>
  )
}
