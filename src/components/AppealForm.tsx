import { useState, type FormEvent } from 'react'
import type { AppealInput, AppealStatus, Channel, VisitorType } from '../api/types'
import { useAppealFields } from '../api/hooks'
import { Button, ErrorText, Field, Input, Segmented, Textarea } from './ui'

const VISITORS = [
  { value: 'xodim', label: 'Xodim' },
  { value: 'talaba', label: 'Talaba' },
  { value: 'mehmon', label: 'Mehmon' },
] as const satisfies ReadonlyArray<{ value: VisitorType; label: string }>

const MODES = [
  { value: 'offline', label: 'Offline (shaxsan)' },
  { value: 'online', label: 'Online' },
] as const

const ONLINE = [
  { value: 'telefon', label: 'Telefon' },
  { value: 'telegram', label: 'Telegram' },
] as const satisfies ReadonlyArray<{ value: Channel; label: string }>

const STATUSES = [
  { value: 'hal_qilindi', label: 'Hal qilindi' },
  { value: 'hal_qilinmadi', label: 'Hal qilinmadi' },
] as const satisfies ReadonlyArray<{ value: AppealStatus; label: string }>

interface Props {
  initial?: Partial<AppealInput>
  submitLabel: string
  submitting?: boolean
  error?: string
  onSubmit: (input: AppealInput) => Promise<unknown>
  onCancel?: () => void
  /** Saqlangandan keyin forma tozalansinmi (yangi murojaat uchun) */
  resetOnSuccess?: boolean
}

/** Toifa, murojaat turi va holat maydonlari superadmin sozlamasiga ko'ra ko'rsatiladi */
export function AppealForm({ initial, submitLabel, submitting, error, onSubmit, onCancel, resetOnSuccess }: Props) {
  const fields = useAppealFields()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [visitorType, setVisitorType] = useState<VisitorType | null>(initial?.visitorType ?? null)
  const [mode, setMode] = useState<'offline' | 'online'>(initial?.channel && initial.channel !== 'offline' ? 'online' : 'offline')
  const [onlineChannel, setOnlineChannel] = useState<Channel | null>(
    initial?.channel && initial.channel !== 'offline' ? initial.channel : null,
  )
  const [status, setStatus] = useState<AppealStatus>(initial?.status ?? 'hal_qilindi')
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [localError, setLocalError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError('')
    if (title.trim().length < 2) return setLocalError('Murojaat nomini kiriting')
    if (fields.visitorType && !visitorType) return setLocalError('Toifani tanlang: xodim, talaba yoki mehmon')
    if (fields.channel && mode === 'online' && !onlineChannel) return setLocalError('Online murojaat kanalini tanlang: telefon yoki telegram')

    await onSubmit({
      title: title.trim(),
      visitorType: fields.visitorType ? visitorType! : undefined,
      channel: fields.channel ? (mode === 'offline' ? 'offline' : onlineChannel!) : undefined,
      status: fields.status ? status : undefined,
      comment: comment.trim(),
    })
    if (resetOnSuccess) {
      setTitle('')
      setVisitorType(null)
      setComment('')
      setStatus('hal_qilindi')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Murojaat nomi" hint="ism yoki joy, muammo">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan: Karimov Anvar yoki 3-bino, 2-qavat — Wi-Fi"
          maxLength={200}
          autoComplete="off"
        />
      </Field>

      {fields.visitorType && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Toifa</p>
          <Segmented label="Toifa" options={[...VISITORS]} value={visitorType} onChange={setVisitorType} />
        </div>
      )}

      {fields.channel && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Murojaat turi</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Segmented label="Murojaat turi" options={[...MODES]} value={mode} onChange={setMode} />
            {mode === 'online' && <Segmented label="Online kanal" options={[...ONLINE]} value={onlineChannel} onChange={setOnlineChannel} />}
          </div>
        </div>
      )}

      {fields.status && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Holat</p>
          <Segmented label="Holat" options={[...STATUSES]} value={status} onChange={setStatus} />
        </div>
      )}

      <Field label="Izoh" hint="ixtiyoriy">
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Qaysi platforma, qanday muammo…" />
      </Field>

      <ErrorText>{localError || error}</ErrorText>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} className="flex-1 sm:flex-none">
          {submitting ? 'Saqlanmoqda…' : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Bekor qilish
          </Button>
        )}
      </div>
    </form>
  )
}
