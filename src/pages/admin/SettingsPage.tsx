import { Send, Settings as SettingsIcon } from 'lucide-react'
import { useDailyReportTest, useSettings, useUpdateSettings } from '../../api/hooks'
import type { Settings } from '../../api/types'
import { useToast } from '../../components/Toast'
import { Button, Card, ErrorText, Loading, PageHeader } from '../../components/ui'

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
    description: "Ish kim uchun bajarilganini belgilash. Masalan, server sozlash kabi ishlarda kerak bo'lmasa o'chiring.",
  },
  {
    key: 'channelEnabled',
    title: 'Murojaat turi (offline / telefon / telegram)',
    description: "Ish qanday so'rov bilan kelganini belgilash. O'chirilsa, offline/online statistikasi ham yashiriladi.",
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
  const dailyTest = useDailyReportTest()
  const toast = useToast()

  return (
    <>
      <PageHeader icon={SettingsIcon} title="Sozlamalar" />
      <Card title="Ish formasidagi maydonlar">
        <p className="mb-4 text-sm text-slate-500">
          O'chirilgan maydon formadan, ro'yxatlardan, statistikadan va Excel'dan yashiriladi. Avval kiritilgan qiymatlar bazada saqlanib qoladi va
          qayta yoqilganda ko'rinadi. "Ish nomi" va "Izoh" doim bor.
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

      <Card title="Choraklik hisobot" className="mt-5">
        {settings.data && (
          <div className="flex items-start justify-between gap-4 py-1">
            <div>
              <p className="font-medium text-slate-900">Rahbarlar hisobot tayyorlay olsin</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Har bir tayyorlash AI'ga so‘rov yuboradi va pullik token sarflaydi. O‘chirilganda markaz va bo‘lim boshliqlari yangi hisobot
                tayyorlay olmaydi — tayyor hisobotlarni ko‘rish, tahrirlash va Word'ga yuklash ochiq qoladi. Superadmin har doim tayyorlay oladi.
              </p>
            </div>
            <Toggle
              label="Rahbarlar hisobot tayyorlay olsin"
              checked={settings.data.reportGenerationEnabled}
              disabled={update.isPending}
              onChange={(v) => update.mutate({ reportGenerationEnabled: v })}
            />
          </div>
        )}
      </Card>

      <Card title="Kunlik hisobot (Telegram)" className="mt-5">
        {settings.data && (
          <>
            <div className="flex items-start justify-between gap-4 py-1">
              <div>
                <p className="font-medium text-slate-900">Har kuni 18:00 da bo‘lim boshliqlariga yuborilsin</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Bugun berilgan topshiriqlar va ularning holati, kim nechta ish yozgani, bugun bitta ham ish yozmaganlar (ta’tildagilardan
                  tashqari). Yakshanba kuni yuborilmaydi. Telegram ID kiritilgan bo‘lim boshliqlariga boradi.
                </p>
              </div>
              <Toggle
                label="Kunlik hisobot"
                checked={settings.data.dailyReportEnabled}
                disabled={update.isPending}
                onChange={(v) => update.mutate({ dailyReportEnabled: v })}
              />
            </div>
            <Button
              variant="secondary"
              className="mt-3"
              disabled={dailyTest.isPending}
              onClick={() =>
                dailyTest
                  .mutateAsync()
                  .then(() => toast.success('Bugungi hisobot Telegram’ingizga yuborildi'))
                  .catch((e: Error) => toast.error(e.message))
              }
            >
              <Send className="size-4" strokeWidth={2} aria-hidden />
              Hozirgi holatni menga yuborish (sinov)
            </Button>
          </>
        )}
      </Card>
    </>
  )
}
