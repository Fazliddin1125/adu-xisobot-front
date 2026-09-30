import { BarChart3, Download } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { exportAppeals, useAppeals, useDepartments, useStaffStats, useStats, useAppealFields } from '../../api/hooks'
import type { DepartmentRow, StaffRow } from '../../api/types'
import { AppealTable } from '../../components/AppealTable'
import { useToast } from '../../components/Toast'
import { PeriodPicker } from '../../components/PeriodPicker'
import { StatsPanel } from '../../components/StatsPanel'
import { Badge, Button, Card, Empty, Loading, PageHeader, Select } from '../../components/ui'
import { periodLabel } from '../../lib/period'
import { ROLE_LABELS } from '../../lib/roles'

type Row = { key: string; title: ReactNode; subtitle?: ReactNode; onClick?: () => void } & Pick<StaffRow, 'total' | 'offline' | 'online' | 'resolved'>

/** Xodimlar yoki bo'limlar kesimidagi jadval, jami ustunida nisbiy chiziq bilan */
function CountsTable({ firstHeader, rows }: { firstHeader: string; rows: Row[] }) {
  const fields = useAppealFields()
  const statusEnabled = fields.status
  const max = Math.max(1, ...rows.map((r) => r.total))
  const sum = (k: 'total' | 'offline' | 'online' | 'resolved') => rows.reduce((s, r) => s + r[k], 0)
  if (!rows.length) return <Empty>Ma'lumot yo'q</Empty>
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-5">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="border-y border-line text-[13px] text-slate-500">
          <tr>
            <th className="px-4 py-2 font-normal sm:pl-5">{firstHeader}</th>
            <th className="w-1/3 px-3 py-2 font-normal">Jami</th>
            {fields.channel && (
              <>
                <th className="px-3 py-2 text-right font-normal">Offline</th>
                <th className="px-3 py-2 text-right font-normal">Online</th>
              </>
            )}
            {statusEnabled && <th className="px-4 py-2 text-right font-normal sm:pr-5">Hal qilindi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.key} onClick={r.onClick} className={r.onClick ? 'cursor-pointer hover:bg-[rgba(55,53,47,0.03)]' : ''}>
              <td className="px-4 py-2.5 sm:pl-5">
                <div className="font-medium text-slate-900">{r.title}</div>
                {r.subtitle && <div className="text-xs text-slate-500">{r.subtitle}</div>}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="tabular w-8 font-semibold text-slate-900">{r.total}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-series-1" style={{ width: `${(r.total / max) * 100}%` }} />
                  </div>
                </div>
              </td>
              {fields.channel && (
                <>
                  <td className="tabular px-3 py-2.5 text-right text-slate-700">{r.offline}</td>
                  <td className="tabular px-3 py-2.5 text-right text-slate-700">{r.online}</td>
                </>
              )}
              {statusEnabled && (
                <td className="tabular px-4 py-2.5 text-right text-slate-700 sm:pr-5">
                  {r.resolved}
                  {r.total > 0 && <span className="ml-1 text-xs text-slate-400">({Math.round((r.resolved / r.total) * 100)}%)</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-line font-semibold text-slate-900">
          <tr>
            <td className="px-4 py-2.5 sm:pl-5">Jami</td>
            <td className="tabular px-3 py-2.5">{sum('total')}</td>
            {fields.channel && (
              <>
                <td className="tabular px-3 py-2.5 text-right">{sum('offline')}</td>
                <td className="tabular px-3 py-2.5 text-right">{sum('online')}</td>
              </>
            )}
            {statusEnabled && <td className="tabular px-4 py-2.5 text-right sm:pr-5">{sum('resolved')}</td>}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function ReportsPage() {
  const [period, setPeriod] = useState('month')
  const [departmentId, setDepartmentId] = useState('')
  const scope = { departmentId: departmentId || undefined }
  const departments = useDepartments()
  const stats = useStats(period, scope)
  const staff = useStaffStats(period, scope.departmentId)
  const appeals = useAppeals(period, scope)
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const toast = useToast()
  const deptName = departments.data?.find((d) => d.id === departmentId)?.name

  async function handleExport() {
    setExporting(true)
    try {
      await exportAppeals(period, scope)
      toast.success('Excel fayl yuklab olindi')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setExporting(false)
    }
  }

  const staffRows: Row[] = (staff.data?.rows ?? []).map((r) => ({
    ...r,
    key: r.staffId,
    title: (
      <>
        {r.fullName} {r.role !== 'xodim' && <Badge tone="amber">{ROLE_LABELS[r.role]}</Badge>}
      </>
    ),
    subtitle: r.departmentName ?? "Bo'limsiz",
    onClick: () => navigate(`/xodimlar/${r.staffId}`),
  }))
  const deptRows: Row[] = (staff.data?.departments ?? []).map((d: DepartmentRow) => ({
    ...d,
    key: d.departmentId ?? 'none',
    title: d.name,
    subtitle: `${d.staffCount} xodim`,
    onClick: d.departmentId ? () => setDepartmentId(d.departmentId!) : undefined,
  }))

  return (
    <>
      <PageHeader
        icon={BarChart3}
        title="Hisobot"
        subtitle={`${deptName ?? 'Barcha bo\'limlar'} · ${periodLabel(period)}`}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Select aria-label="Bo'lim" className="sm:w-52" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Barcha bo'limlar</option>
              {departments.data?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <PeriodPicker value={period} onChange={setPeriod} />
          </div>
        }
      />
      <div className="space-y-6">
        <StatsPanel stats={stats.data} period={period} />

        {!departmentId && deptRows.length > 1 && (
          <Card title="Bo'limlar kesimida">
            <CountsTable firstHeader="Bo'lim" rows={deptRows} />
          </Card>
        )}

        <Card
          title="Xodimlar kesimida"
          action={
            <Button variant="secondary" onClick={handleExport} disabled={exporting}>
              <Download className="size-4" strokeWidth={2} aria-hidden />
              {exporting ? 'Tayyorlanmoqda…' : 'Excelga yuklash'}
            </Button>
          }
        >
          {staff.isLoading ? <Loading /> : <CountsTable firstHeader="Xodim" rows={staffRows} />}
        </Card>

        <Card title={`Barcha ishlar${appeals.data ? ` · ${appeals.data.length}` : ''}`}>
          {appeals.isLoading ? <Loading /> : <AppealTable appeals={appeals.data ?? []} showStaff />}
        </Card>
      </div>
    </>
  )
}
