import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Notion "peek" oynasi: markazda, katta soya, yumshoq burchaklar */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,15,15,0.4)] p-0 sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-notion sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-4 py-2.5 backdrop-blur">
          <h2 className="text-sm text-slate-500">{title}</h2>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-hover hover:text-slate-700" aria-label="Yopish">
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        <div className="px-5 pb-6 sm:px-8">{children}</div>
      </div>
    </div>
  )
}
