import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Dialog oynasi: telefonda pastdan chiqadi, kompyuterda markazda */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-notion sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur sm:px-5">
          <h2 className="text-sm font-medium text-slate-700">{title}</h2>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-hover hover:text-slate-700" aria-label="Yopish">
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        <div className="px-5 pt-4 pb-6 sm:px-6">{children}</div>
      </div>
    </div>
  )
}
