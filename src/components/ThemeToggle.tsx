import { useSyncExternalStore } from 'react'
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { getThemeMode, isDark, onThemeChange, setThemeMode, type ThemeMode } from '../lib/theme'

const MODES: Array<{ mode: ThemeMode; icon: LucideIcon; label: string }> = [
  { mode: 'system', icon: Monitor, label: 'Tizim' },
  { mode: 'light', icon: Sun, label: 'Yorug‘' },
  { mode: 'dark', icon: Moon, label: 'Qorong‘i' },
]

function useThemeMode(): ThemeMode {
  return useSyncExternalStore(onThemeChange, getThemeMode)
}

/** Yon menyu uchun: Tizim / Yorug' / Qorong'i */
export function ThemeToggle() {
  const current = useThemeMode()
  return (
    <div role="radiogroup" aria-label="Mavzu" className="flex rounded-md border border-line bg-slate-100 p-0.5">
      {MODES.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={current === mode}
          title={label}
          onClick={() => setThemeMode(mode)}
          className={`flex h-6 flex-1 items-center justify-center gap-1 rounded text-[11px] transition ${
            current === mode ? 'bg-surface text-slate-900 shadow-card' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Icon className="size-3.5" strokeWidth={2} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )
}

/** Ixcham tugma (telefon sarlavhasi): yorug' ↔ qorong'i */
export function ThemeButton({ className = '' }: { className?: string }) {
  useThemeMode()
  const dark = isDark()
  return (
    <button
      type="button"
      onClick={() => setThemeMode(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}
      className={`flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-hover hover:text-slate-900 ${className}`}
    >
      {dark ? <Sun className="size-4" strokeWidth={2} /> : <Moon className="size-4" strokeWidth={2} />}
    </button>
  )
}
