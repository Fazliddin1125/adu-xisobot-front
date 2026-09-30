import { Settings as SettingsIcon } from 'lucide-react'
import { useSettings, useUpdateSettings } from '../../api/hooks'
import type { Settings } from '../../api/types'
import { Card, ErrorText, Loading, PageHeader } from '../../components/ui'

function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-brand-600' : 'bg-slate-300'}`}
    >
      <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
    </button>
  )
}

const FIELD_TOGGLES: Array<{ key: keyof Settings; title: string; description: string }> = [
  {
    key: 'visitorTypeEnabled',
    title: 'Toifa (xodim / talaba / mehmon)',
    description: "Murojaat kim tomonidan kelganini belgilash. Masalan, Wi-Fi yoki jihoz nosozligi kabi murojaatlarda kerak bo'lmasa o'chiring.",
  },
  {
    key: 'channelEnabled',
    title: 'Murojaat turi (offline / telefon / telegram)',
    description: "Murojaat qanday kelganini belgilash. O'chirilsa, offline/online statistikasi ham yashiriladi.",
  },
  {
    key: 'appealStatusEnabled',
    title: 'Holat (hal qilindi / hal qilinmadi)',
    description: "Yoqilganda statistikada hal qilinganlar foizi ko'rinadi.",
  },
]

export function SettingsPage() {
  const settings = useSettings()
  const update = useUpdateSettings()

  return (
    <>
      <PageHeader icon={SettingsIcon} title="Sozlamalar" />
      <Card title="Murojaat formasidagi maydonlar">
        <p className="mb-4 text-sm text-slate-500">
          O'chirilgan maydon formadan, ro'yxatlardan, statistikadan va Excel'dan yashiriladi. Avval kiritilgan qiymatlar bazada saqlanib qoladi va
          qayta yoqilganda ko'rinadi. "Murojaat nomi" va "Izoh" doim bor.
        </p>
        {settings.isLoading || !settings.data ? (
          <Loading />
        ) : (
          <ul className="divide-y divide-line">
            {FIELD_TOGGLES.map((f) => (
              <li key={f.key} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{f.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{f.description}</p>
                </div>
                <Toggle label={f.title} checked={settings.data![f.key]} disabled={update.isPending} onChange={(v) => update.mutate({ [f.key]: v })} />
              </li>
            ))}
          </ul>
        )}
        <ErrorText>{update.error?.message}</ErrorText>
      </Card>
    </>
  )
}
