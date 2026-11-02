import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { useRemind } from '../api/hooks'
import type { DeliveryLog } from '../api/types'
import { DeliveryResults } from './DeliveryResults'
import { Modal } from './Modal'
import { Button, ErrorText } from './ui'

/** Rahbar: xodimlarga Telegram orqali "ishlaringizni botga yozing" eslatmasi; natijada kim olgani ko'rinadi */
export function RemindButton() {
  const [open, setOpen] = useState(false)
  /** undefined — hali yuborilmagan; null — yuboriladigan odam topilmadi */
  const [result, setResult] = useState<DeliveryLog | null | undefined>(undefined)
  const remind = useRemind()

  function close() {
    setOpen(false)
    setResult(undefined)
    remind.reset()
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
            <>
              <p className="mb-4 text-sm text-slate-600">
                Xodimlarga bot orqali «Qilgan ishlaringizni yozib qo‘ying» xabari boradi — «✍️ Ish yozish» tugmasi va 00:00 gacha yozilmasa
                −1 jarima balli haqida ogohlantirish bilan. Bo‘lim boshliqlari va ta’tildagilarga yuborilmaydi.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button disabled={remind.isPending} onClick={() => remind.mutateAsync(true).then(setResult)}>
                  Bugun ish yozmaganlarga
                </Button>
                <Button variant="secondary" disabled={remind.isPending} onClick={() => remind.mutateAsync(false).then(setResult)}>
                  Hamma xodimlarga
                </Button>
              </div>
              <ErrorText>{remind.error?.message}</ErrorText>
            </>
          ) : result === null ? (
            <p className="text-sm text-slate-600">Eslatma yuboriladigan xodim topilmadi — hamma bugun ish yozgan.</p>
          ) : (
            <DeliveryResults results={result.results} />
          )}
        </Modal>
      )}
    </>
  )
}
