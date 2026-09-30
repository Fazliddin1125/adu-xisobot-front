import { FileText } from 'lucide-react'
import { useState } from 'react'
import { useAppeals, useStats } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'
import { AppealTable } from '../components/AppealTable'
import { PeriodPicker } from '../components/PeriodPicker'
import { StatsPanel } from '../components/StatsPanel'
import { Card, Loading, PageHeader } from '../components/ui'
import { periodLabel } from '../lib/period'

export function MyAppealsPage() {
  const [period, setPeriod] = useState('month')
  const { user } = useAuth()
  // Admin uchun ham faqat o'zining murojaatlari
  const stats = useStats(period, { staffId: user?.id })
  const appeals = useAppeals(period, { staffId: user?.id })

  return (
    <>
      <PageHeader icon={FileText} title="Mening ishlarim" subtitle={periodLabel(period)} action={<PeriodPicker value={period} onChange={setPeriod} />} />
      <div className="space-y-6">
        <StatsPanel stats={stats.data} period={period} />
        <Card title={`Ishlar ro'yxati${appeals.data ? ` · ${appeals.data.length}` : ''}`}>
          {appeals.isLoading ? <Loading /> : <AppealTable appeals={appeals.data ?? []} />}
        </Card>
      </div>
    </>
  )
}
