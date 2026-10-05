import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, type LucideIcon } from 'lucide-react'

type Kind = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  kind: Kind
  text: string
}

interface ToastApi {
  success: (text: string) => void
  error: (text: string) => void
  info: (text: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)
const ICONS: Record<Kind, LucideIcon> = { success: CircleCheck, error: CircleAlert, info: Info }
const STYLES: Record<Kind, string> = {
  success: 'bg-tag-green-bg text-tag-green',
  error: 'bg-tag-red-bg text-tag-red',
  info: 'bg-tag-blue-bg text-tag-blue',
}

/** alert() o'rniga: pastda paydo bo'lib, o'zi yo'qoladigan yumshoq xabarchalar */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((kind: Kind, text: string) => {
    const id = Date.now() + Math.random()
    setItems((xs) => [...xs.slice(-2), { id, kind, text }])
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), kind === 'error' ? 6000 : 3500)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({ success: (t) => push('success', t), error: (t) => push('error', t), info: (t) => push('info', t) }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] md:bottom-4 flex flex-col items-center gap-2 px-4">
        {items.map((t) => {
          const Icon = ICONS[t.kind]
          return (
          <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'} className="pointer-events-auto flex max-w-md animate-toast-in items-center gap-3 rounded-2xl bg-white py-2.5 pr-4 pl-2.5 text-sm text-slate-800 shadow-notion">
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${STYLES[t.kind]}`}>
              <Icon className="size-4" strokeWidth={2.2} aria-hidden />
            </span>
            {t.text}
          </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast ToastProvider ichida ishlatilishi kerak')
  return ctx
}
