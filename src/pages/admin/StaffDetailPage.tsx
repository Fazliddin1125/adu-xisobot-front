import { ArrowLeft, Download, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { exportAppeals, useAppeals, useDepartments, useStats, useUser } from '../../api/hooks'
import { AppealTable } from '../../components/AppealTable'
import { useToast } from '../../components/Toast'
import { PeriodPicker } from '../../components/PeriodPicker'
import { StatsPanel } from '../../components/StatsPanel'
import { VacationCard } from '../../components/VacationCard'
import { Button, Card, Loading, PageHeader } from '../../components/ui'
import { periodLabel } from '../../lib/period'
import { ROLE_LABELS } from '../../lib/roles'

export function StaffDetailPage() {
  const { id = '' } = useParams()
  const [period, setPeriod] = useState('month')
  const user = useUser(id)
  const toast = useToast()
  const departments = useDepartments()
  const stats = useStats(period, { staffId: id })
  const appeals = useAppeals(period, { staffId: id })
  const dept = departments.data?.find((d) => d.id === user.data?.departmentId)?.name

  return (
    <>
      <Link to="/xodimlar" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
        Xodimlar
      </Link>
      <PageHeader
        icon={UserRound}
        title={user.data?.fullName ?? '…'}
        subtitle={user.data && `${ROLE_LABELS[user.data.role]} · ${dept ?? "Bo'limsiz"} · ${periodLabel(period)}`}
        action={<PeriodPicker value={period} onChange={setPeriod} />}
      />
      <div className="space-y-6">
        {user.data && <VacationCard key={user.data.id} user={user.data} />}
        <StatsPanel stats={stats.data} period={period} />
        <Card
          title={`Ishlar${appeals.data ? ` · ${appeals.data.length}` : ''}`}
          action={
            <Button variant="secondary" onClick={() => exportAppeals(period, { staffId: id }).then(() => toast.success('Excel fayl yuklab olindi')).catch((e) => toast.error(e.message))}>
              <Download className="size-4" strokeWidth={2} aria-hidden />
              Excelga yuklash
            </Button>
          }
        >
          {appeals.isLoading ? <Loading /> : <AppealTable appeals={appeals.data ?? []} />}
        </Card>
      </div>
    </>
  )
}
