import { useEffect, useState } from 'react'
import { useSettings, useUpdateSettings } from '../api/hooks'
import { useToast } from './Toast'
import { Button, Card, ErrorText, Field, Textarea } from './ui'

/** Superadmin: eslatma va qattiq eslatma matnlari (bot yuboradi) */
export function ReminderTextsCard() {
  const settings = useSettings().data
  const update = useUpdateSettings()
  const toast = useToast()
  const [reminder, setReminder] = useState('')
  const [strict, setStrict] = useState('')

  useEffect(() => {
    if (settings) {
      setReminder(settings.reminderText)
      setStrict(settings.strictReminderText)
    }
  }, [settings])

  if (!settings) return null
  const changed = reminder !== settings.reminderText || strict !== settings.strictReminderText

  async function save() {
    await update.mutateAsync({ reminderText: reminder, strictReminderText: strict })
    toast.success('Eslatma matnlari saqlandi')
  }

  return (
    <Card title="Eslatma matnlari (Telegram bot)" className="mt-5">
      <p className="mb-4 text-sm text-slate-500">
        <b>{'{ism}'}</b> o‘rniga xodimning ismi, <b>{'{ball}'}</b> o‘rniga jami jarima ballari qo‘yiladi. Oddiy eslatma har kuni 18:00 da avtomatik
        ham yuboriladi; qattiq eslatmani rahbar «Eslatma yuborish» tugmasidan tanlaydi.
      </p>
      <div className="space-y-4">
        <Field label="Eslatma">
          <Textarea rows={5} maxLength={1500} value={reminder} onChange={(e) => setReminder(e.target.value)} />
        </Field>
        <Field label="Qattiq eslatma">
          <Textarea rows={7} maxLength={1500} value={strict} onChange={(e) => setStrict(e.target.value)} />
        </Field>
        <ErrorText>{update.error?.message}</ErrorText>
        <div className="flex gap-2">
          <Button disabled={!changed || update.isPending} onClick={save}>
            Saqlash
          </Button>
          {changed && (
            <Button
              variant="ghost"
              onClick={() => {
                setReminder(settings.reminderText)
                setStrict(settings.strictReminderText)
              }}
            >
              Bekor qilish
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
