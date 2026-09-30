import type { ReactNode } from 'react'
import type { Stats } from '../api/types'
import { useAppealFields } from '../api/hooks'
import type { PeriodValue } from '../lib/period'
import { DailyChart } from './charts/DailyChart'
import { SplitBar } from './charts/SplitBar'
import { StatCard } from './StatCard'
import { Card, Loading } from './ui'

const GRID_COLS = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-2 lg:grid-cols-3', 'grid-cols-2 lg:grid-cols-4']

/** Kartochkalar va grafiklar o'chirilgan maydonlarga (toifa, turi, holat) moslashadi */
export function StatsPanel({ stats, period }: { stats?: Stats; period: PeriodValue }) {
  const fields = useAppealFields()
  if (!stats) return <Loading />
  const resolvedPct = stats.total ? Math.round((stats.byStatus.hal_qilindi / stats.total) * 100) : 0

  const cards: ReactNode[] = [<StatCard key="total" label="Jami" value={stats.total} accent />]
  if (fields.channel) {
    cards.push(
      <StatCard key="off" label="Offline" value={stats.offline} hint="shaxsan kelganlar" />,
      <StatCard key="on" label="Online" value={stats.online} hint={`telefon ${stats.byChannel.telefon} · telegram ${stats.byChannel.telegram}`} />,
    )
  }
  if (fields.status) {
    cards.push(
      <StatCard key="res" label="Hal qilindi" value={`${resolvedPct}%`} hint={`${stats.byStatus.hal_qilindi} ta / hal qilinmadi ${stats.byStatus.hal_qilinmadi}`} />,
    )
  }

  const splits: ReactNode[] = []
  if (fields.channel) {
    splits.push(
      <SplitBar
        key="channel"
        title="Murojaat turi"
        parts={[
          { label: 'Offline', value: stats.byChannel.offline },
          { label: 'Telefon', value: stats.byChannel.telefon },
          { label: 'Telegram', value: stats.byChannel.telegram },
        ]}
      />,
    )
  }
  if (fields.visitorType) {
    splits.push(
      <SplitBar
        key="type"
        title="Toifa"
        parts={[
          { label: 'Xodim', value: stats.byVisitorType.xodim },
          { label: 'Talaba', value: stats.byVisitorType.talaba },
          { label: 'Mehmon', value: stats.byVisitorType.mehmon },
        ]}
      />,
    )
  }

  const showChart = period !== 'today'
  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${GRID_COLS[cards.length]}`}>{cards}</div>

      {(showChart || splits.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-3">
          {showChart && (
            <Card title="Kunlar kesimida" className={splits.length ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <DailyChart data={stats.daily} />
            </Card>
          )}
          {splits.length > 0 && (
            <Card title="Taqsimot" className={showChart ? '' : 'lg:col-span-3'}>
              <div className={showChart ? 'space-y-6' : 'grid gap-6 sm:grid-cols-2'}>{splits}</div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
