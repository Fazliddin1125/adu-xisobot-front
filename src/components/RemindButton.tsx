import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { useRemind, useSettings } from '../api/hooks'
import type { DeliveryLog } from '../api/types'
import { DeliveryResults } from './DeliveryResults'
import { Modal } from './Modal'
import { Button, ErrorText, Field, Segmented, Textarea } from './ui'

type Kind = 'eslatma' | 'qattiq' | 'xabar'
const KINDS: Array<{ value: Kind; label: string }> = [
  { value: 'eslatma', label: 'Eslatma' },
  { value: 'qattiq', label: 'Qattiq eslatma' },
  { value: 'xabar', label: 'O‘z matnim' },
]

/**
 * Rahbar: xodimlarga Telegram orqali eslatma, qattiq eslatma yoki o'zi yozgan xabar.
 * Matn Sozlamalardagi shablondan olinadi va shu yerning o'zida o'zgartirsa bo'ladi; natijada kim olgani ko'rinadi.
 */
export function RemindButton() {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<Kind>('eslatma')
  /** null — tanlangan turdagi shablon (tahrirlanmagan) */
  const [text, setText] = useState<string | null>(null)
  /** undefined — hali yuborilmagan; null — yuboriladigan odam topilmadi */
  const [result, setResult] = useState<DeliveryLog | null | undefined>(undefined)
  const remind = useRemind()
  const settings = useSettings().data
  const template = kind === 'eslatma' ? (settings?.reminderText ?? '') : kind === 'qattiq' ? (settings?.strictReminderText ?? '') : ''
  const message = text ?? template

  function close() {
    setOpen(false)
    setResult(undefined)
    setText(null)
    setKind('eslatma')
    remind.reset()
  }

  function send(onlyIdle: boolean) {
    remind.mutateAsync({ onlyIdle, kind, text: message.trim() }).then(setResult)
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <BellRing className="size-4" strokeWidth={2} aria-hidden />
        Eslatma yuborish
      </Button>
      {open && (
        <Modal title="Telegram orqali eslatma" onClose={close}>
          {result === undefined ? (
            <div className="space-y-4">
              <Segmented
                label="Xabar turi"
                options={KINDS}
                value={kind}
                onChange={(k) => {
                  setKind(k)
                  setText(null)
                }}
              />
              <Field label="Matn" hint="{ism} — xodim ismi, {ball} — jarima ballari">
                <Textarea
                  rows={7}
                  maxLength={1500}
                  value={message}
                  placeholder="Xodimlarga yuboriladigan matnni yozing…"
                  onChange={(e) => setText(e.target.value)}
                />
              </Field>
              <p className="text-xs text-slate-500">
                Faqat xodimlarga boradi (bo‘lim boshliqlari va ta’tildagilarga emas). Xabar ostida «✍️ Ish yozish» tugmasi bo‘ladi. Doimiy matnlarni
                Sozlamalarda o‘zgartirasiz.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button disabled={remind.isPending || message.trim().length < 3} onClick={() => send(true)}>
                  Bugun ish yozmaganlarga
                </Button>
                <Button variant="secondary" disabled={remind.isPending || message.trim().length < 3} onClick={() => send(false)}>
                  Hamma xodimlarga
                </Button>
              </div>
              <ErrorText>{remind.error?.message}</ErrorText>
            </div>
          ) : result === null ? (
            <p className="text-sm text-slate-600">Xabar yuboriladigan xodim topilmadi — hamma bugun ish yozgan.</p>
          ) : (
            <DeliveryResults results={result.results} />
          )}
        </Modal>
      )}
    </>
  )
}
