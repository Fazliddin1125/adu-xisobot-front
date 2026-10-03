import { useEffect, useLayoutEffect, useMemo, useRef, useState, type TextareaHTMLAttributes } from 'react'
import { Download, FileText, LoaderCircle, Lock, Plus, RefreshCw, Save, ScrollText, Sparkles, Trash2, TriangleAlert } from 'lucide-react'
import {
  downloadReportDocx,
  useAiStatus,
  useDepartments,
  useGenerateReport,
  useQuarterlyReport,
  useSaveReport,
  type QuarterKey,
} from '../../api/hooks'
import type { QuarterlyReport, ReportContent, ReportHeader, ReportItem, ReportSource } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { useToast } from '../../components/Toast'
import { Badge, Button, Card, Empty, ErrorText, Field, Input, Loading, PageHeader, Segmented, Select, cx } from '../../components/ui'
import { relativeTime } from '../../lib/humanize'
import { currentMonthKey } from '../../lib/period'

const ROMAN = ['I', 'II', 'III', 'IV']

/** Standart chorak: chorakning birinchi oyida — o'tgan chorak (hisobot odatda chorak tugagach yoziladi) */
function defaultQuarter(): { year: number; quarter: number } {
  const [y, m] = currentMonthKey().split('-').map(Number)
  const q = Math.ceil(m / 3)
  if ((m - 1) % 3 !== 0) return { year: y, quarter: q }
  return q === 1 ? { year: y - 1, quarter: 4 } : { year: y, quarter: q - 1 }
}

/** Matnga qarab balandligi o'zgaradigan textarea */
function AutoTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [props.value])
  return (
    <textarea
      ref={ref}
      rows={1}
      className={cx(
        'w-full resize-none overflow-hidden rounded-xl border border-transparent bg-transparent px-2.5 py-1.5 text-[15px] leading-relaxed text-slate-800 transition',
        'hover:border-line-strong focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/15',
        className,
      )}
      {...props}
    />
  )
}

/** Band qaysi yozuvlardan olingani — ustiga olib borilsa asl matn ko'rinadi */
function SourceChips({ refs, sources }: { refs: string[]; sources: Map<string, ReportSource> }) {
  const [open, setOpen] = useState(false)
  if (!refs.length) return null
  return (
    <div className="px-2.5">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-slate-400 hover:text-brand-600">
        {refs.length} ta manba {open ? '▴' : '▾'}
      </button>
      {open && (
        <ul className="mt-1.5 mb-1 space-y-1 rounded-xl bg-slate-50 p-2.5 text-xs">
          {refs.map((r) => {
            const s = sources.get(r)
            return (
              <li key={r} className="flex gap-2">
                <span className="tabular w-8 shrink-0 font-bold text-slate-400">{r}</span>
                <span className="text-slate-600">
                  {s ? (
                    <>
                      {s.text} <span className="text-slate-400">— {s.author}, {new Date(s.date).toLocaleDateString('uz-UZ')}</span>
                    </>
                  ) : (
                    'manba topilmadi'
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ItemsEditor({
  items,
  onChange,
  sources,
  placeholder,
}: {
  items: ReportItem[]
  onChange: (items: ReportItem[]) => void
  sources: Map<string, ReportSource>
  placeholder: string
}) {
  return (
    <div className="space-y-1">
      {items.map((it, i) => (
        <div key={i} className="group relative rounded-xl py-1 transition hover:bg-slate-50/70">
          <div className="flex items-start gap-1">
            <span className="mt-2.5 w-5 shrink-0 text-right text-xs font-bold text-slate-300">{i + 1}.</span>
            <AutoTextarea
              value={it.text}
              aria-label={`${i + 1}-band`}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
            />
            <button
              type="button"
              title="Bandni o'chirish"
              aria-label="Bandni o'chirish"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-hover hover:text-ink-red focus:opacity-100"
            >
              <Trash2 className="size-4" strokeWidth={1.9} />
            </button>
          </div>
          <div className="pl-6">
            <SourceChips refs={it.sources} sources={sources} />
          </div>
        </div>
      ))}
      {!items.length && <p className="px-8 py-2 text-sm text-slate-400">{placeholder}</p>}
      <button
        type="button"
        onClick={() => onChange([...items, { text: '', sources: [] }])}
        className="ml-6 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-400 hover:bg-hover hover:text-slate-700"
      >
        <Plus className="size-4" strokeWidth={2} aria-hidden />
        Band qo'shish
      </button>
    </div>
  )
}

const HEADER_FIELDS: Array<{ key: keyof ReportHeader; label: string }> = [
  { key: 'approverTitle', label: 'Tasdiqlovchi lavozimi' },
  { key: 'approverName', label: 'Tasdiqlovchi (F.I.Sh)' },
  { key: 'centerName', label: 'Markaz nomi' },
  { key: 'departmentName', label: 'Bo‘lim nomi (sarlavhada)' },
  { key: 'signerTitle', label: 'Imzolovchi lavozimi' },
  { key: 'signerName', label: 'Imzolovchi (F.I.Sh)' },
]

function ReportEditor({ report }: { report: QuarterlyReport & { content: ReportContent } }) {
  const toast = useToast()
  const save = useSaveReport()
  const [header, setHeader] = useState(report.header)
  const [content, setContent] = useState(report.content)
  const [dirty, setDirty] = useState(false)
  const sources = useMemo(() => new Map(report.sources.map((s) => [s.ref, s])), [report.sources])

  // Server tomonda yangi versiya kelsa (qayta yaratildi) — tahrirlanmagan bo'lsa yangilaymiz
  useEffect(() => {
    if (!dirty) {
      setHeader(report.header)
      setContent(report.content)
    }
  }, [report.updatedAt]) // eslint-disable-line react-hooks/exhaustive-deps

  const edit = (next: Partial<ReportContent>) => {
    setContent((c) => ({ ...c, ...next }))
    setDirty(true)
  }

  async function persist() {
    const cleaned: ReportContent = {
      ...content,
      months: content.months.map((m) => ({ ...m, items: m.items.filter((i) => i.text.trim()) })),
      extra: content.extra.filter((i) => i.text.trim()),
      conclusion: content.conclusion.filter((p) => p.trim()),
    }
    await save.mutateAsync({ id: report.id, header, content: cleaned })
    setDirty(false)
  }

  async function handleSave() {
    try {
      await persist()
      toast.success('O‘zgarishlar saqlandi')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function handleDownload() {
    try {
      if (dirty) await persist()
      await downloadReportDocx(report.id)
      toast.success('Word fayl yuklab olindi')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const itemCount = content.months.reduce((n, m) => n + m.items.length, 0) + content.extra.length

  return (
    <div className="space-y-5 pb-24">
      <Card title="Sarlavha va imzolar" subtitle="Word hujjatining yuqori va pastki qismi">
        <div className="grid gap-3 sm:grid-cols-2">
          {HEADER_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <Input
                value={header[f.key]}
                onChange={(e) => {
                  setHeader({ ...header, [f.key]: e.target.value })
                  setDirty(true)
                }}
              />
            </Field>
          ))}
        </div>
      </Card>

      <Card title="Umumiy ma’lumot">
        <AutoTextarea value={content.summary} aria-label="Umumiy ma’lumot" onChange={(e) => edit({ summary: e.target.value })} />
      </Card>

      <Card title="Hisobot davrida bajarilgan asosiy ishlar" subtitle={`${itemCount} ta band · ${report.sources.length} ta yozuvdan`}>
        <div className="space-y-6">
          {content.months.map((m, mi) => (
            <section key={m.month}>
              <h3 className="mb-1 px-2.5 text-sm font-bold text-slate-800">
                {m.name} oyida bajarilgan ishlar <span className="font-normal text-slate-400">· {m.items.length}</span>
              </h3>
              <ItemsEditor
                items={m.items}
                sources={sources}
                placeholder="Bu oyda band yo‘q — Word hujjatida bu oy ko‘rsatilmaydi."
                onChange={(items) => edit({ months: content.months.map((x, j) => (j === mi ? { ...x, items } : x)) })}
              />
            </section>
          ))}
        </div>
      </Card>

      <Card title="Qo‘shimcha ishlar" subtitle="Chorak davomida bajarilgan topshiriqlardan">
        <ItemsEditor items={content.extra} sources={sources} placeholder="Bo‘lim bo‘sh — Word hujjatida ko‘rsatilmaydi." onChange={(extra) => edit({ extra })} />
      </Card>

      <Card title="Xulosa">
        <div className="space-y-2">
          {content.conclusion.map((p, i) => (
            <div key={i} className="group flex items-start gap-1">
              <AutoTextarea
                value={p}
                aria-label={`Xulosa ${i + 1}-paragraf`}
                onChange={(e) => edit({ conclusion: content.conclusion.map((x, j) => (j === i ? e.target.value : x)) })}
              />
              <button
                type="button"
                aria-label="Paragrafni o'chirish"
                onClick={() => edit({ conclusion: content.conclusion.filter((_, j) => j !== i) })}
                className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-hover hover:text-ink-red focus:opacity-100"
              >
                <Trash2 className="size-4" strokeWidth={1.9} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => edit({ conclusion: [...content.conclusion, ''] })}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-400 hover:bg-hover hover:text-slate-700"
          >
            <Plus className="size-4" strokeWidth={2} aria-hidden />
            Paragraf qo'shish
          </button>
        </div>
      </Card>

      {/* Pastda doim ko'rinadigan amallar paneli */}
      <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 md:pl-64">
        <div className="flex items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-notion backdrop-blur">
          <span className={cx('px-2 text-sm', dirty ? 'font-semibold text-tag-yellow' : 'text-slate-400')}>
            {dirty ? 'Saqlanmagan o‘zgarishlar' : 'Hammasi saqlangan'}
          </span>
          <Button variant="secondary" onClick={handleSave} disabled={!dirty || save.isPending}>
            <Save className="size-4" strokeWidth={2} aria-hidden />
            Saqlash
          </Button>
          <Button onClick={handleDownload} disabled={save.isPending}>
            <Download className="size-4" strokeWidth={2} aria-hidden />
            Word'ga yuklash
          </Button>
        </div>
      </div>
    </div>
  )
}

export function QuarterlyReportPage() {
  const { user } = useAuth()
  const toast = useToast()
  const departments = useDepartments()
  const ai = useAiStatus()
  const generate = useGenerateReport()
  const initial = useMemo(defaultQuarter, [])
  const [departmentId, setDepartmentId] = useState('')
  const [year, setYear] = useState(initial.year)
  const [quarter, setQuarter] = useState(initial.quarter)

  // Standart bo'lim — o'zimniki, bo'lmasa birinchisi
  useEffect(() => {
    if (!departmentId && departments.data?.length) {
      setDepartmentId(departments.data.find((d) => d.id === user?.departmentId)?.id ?? departments.data[0].id)
    }
  }, [departments.data, departmentId, user])

  const key: QuarterKey | null = departmentId ? { departmentId, year, quarter } : null
  const report = useQuarterlyReport(key)
  const data = report.data
  const years = [initial.year, initial.year - 1, initial.year - 2]

  async function handleGenerate() {
    if (!key) return
    if (data?.content && !confirm('Hisobot qaytadan yoziladi va qilingan tahrirlar o‘chadi. Davom etasizmi?')) return
    try {
      await generate.mutateAsync(key)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <>
      <PageHeader
        icon={ScrollText}
        title="Choraklik hisobot"
        subtitle="Xodimlarning ishlari va bajarilgan topshiriqlardan rasmiy hisobot tuziladi"
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Select aria-label="Bo'lim" className="sm:w-60" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              {departments.data?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <Select aria-label="Yil" className="sm:w-28" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <Segmented
              label="Chorak"
              options={ROMAN.map((r, i) => ({ value: String(i + 1), label: `${r} chorak` }))}
              value={String(quarter)}
              onChange={(v) => setQuarter(Number(v))}
              size="sm"
            />
          </div>
        }
      />

      {ai.data && !ai.data.canGenerate && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          <Lock className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
          <p>
            <b>Hisobot tayyorlash vaqtincha o‘chirilgan.</b> Superadmin yoqmaguncha yangi hisobot tayyorlab bo‘lmaydi. Tayyor hisobotlarni ko‘rish,
            tahrirlash va Word'ga yuklash mumkin.
          </p>
        </div>
      )}

      {ai.data && !ai.data.enabled && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-tag-yellow-bg/70 px-4 py-3 text-sm text-tag-yellow">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
          <p>
            <b>AI hali ulanmagan.</b> Hisobot qoralama sifatida tuziladi: yozuvlar tahrirsiz qo‘yiladi, takrorlari birlashtiriladi. Matnni shu
            sahifada o‘zingiz tahrirlashingiz mumkin. Anthropic API kaliti qo‘shilgach, AI rasmiy uslubda yozib beradi.
          </p>
        </div>
      )}

      {!departments.data?.length && !departments.isLoading ? (
        <Empty>Hali bo‘lim yo‘q — avval "Bo‘limlar" sahifasida bo‘lim yarating</Empty>
      ) : report.isLoading || !key ? (
        <Loading />
      ) : data?.status === 'generating' ? (
        <Card>
          <div className="flex flex-col items-center py-10 text-center">
            <LoaderCircle className="mb-3 size-8 animate-spin text-brand-500" strokeWidth={2} aria-hidden />
            <p className="font-semibold text-slate-800">{ai.data?.enabled ? 'AI hisobotni yozmoqda…' : 'Qoralama tayyorlanmoqda…'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {data.sources.length} ta yozuv tahlil qilinmoqda. Bu 1–2 daqiqa olishi mumkin, sahifani yopmasangiz ham bo‘ladi.
            </p>
          </div>
        </Card>
      ) : !data || !data.content ? (
        <Card>
          <div className="flex flex-col items-center py-10 text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden>
              <FileText className="size-6" strokeWidth={1.75} />
            </span>
            <p className="font-semibold text-slate-800">
              {year}-yil {ROMAN[quarter - 1]}-chorak hisoboti hali tayyorlanmagan
            </p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Bo‘lim xodimlarining shu chorakdagi barcha ishlari va bajarilgan topshiriqlari yig‘iladi. Keyin matnni ko‘rib chiqib, Word’ga
              yuklab olasiz.
            </p>
            {data?.status === 'failed' && <ErrorText>{data.error}</ErrorText>}
            <Button className="mt-5" onClick={handleGenerate} disabled={generate.isPending || !ai.data?.canGenerate}>
              <Sparkles className="size-4" strokeWidth={2} aria-hidden />
              Hisobotni tayyorlash
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Badge tone={data.writer === 'qoralama' ? 'amber' : 'purple'}>
                {data.writer === 'qoralama' ? 'Qoralama (AI’siz)' : <>AI yozdi · {data.writer}</>}
              </Badge>
              {data.generatedAt && <span>tayyorlangan: {relativeTime(data.generatedAt)}</span>}
              {data.status === 'failed' && <Badge tone="red">Oxirgi urinish xato: {data.error}</Badge>}
            </div>
            <Button variant="ghost" onClick={handleGenerate} disabled={generate.isPending || !ai.data?.canGenerate}>
              <RefreshCw className="size-4" strokeWidth={2} aria-hidden />
              Qayta tayyorlash
            </Button>
          </div>
          <ReportEditor key={data.id} report={{ ...data, content: data.content }} />
        </>
      )}
    </>
  )
}
