import { Send } from 'lucide-react'
import { useDeliveries } from '../../api/hooks'
import type { DeliveryLog } from '../../api/types'
import { DeliveryResults } from '../../components/DeliveryResults'
import { RemindButton } from '../../components/RemindButton'
import { Badge, Card, Empty, Loading, PageHeader } from '../../components/ui'
import { formatDateTime } from '../../lib/period'

const KIND_LABEL: Record<DeliveryLog['kind'], string> = {
  eslatma: '18:00 eslatma',
  qolda_eslatma: 'Qo‘lda eslatma',
  jarima: 'Jarima xabari',
  kunlik_hisobot: 'Kunlik hisobot',
}

/** Superadmin: bot yuborgan xabarlar — kim oldi, kim olmadi (botga /start bosmagan va h.k.) */
export function DeliveriesPage() {
  const logs = useDeliveries()
  return (
    <>
      <PageHeader
        icon={Send}
        title="Bot xabarlari"
        subtitle="Bot kimga xabar yubordi va kimga yetib bormadi — oxirgi 90 kun"
        action={<RemindButton />}
      />
      {logs.isLoading ? (
        <Loading />
      ) : !logs.data?.length ? (
        <Empty icon={Send}>Hali xabar yuborilmagan. «Eslatma yuborish» tugmasini bosing — natija shu yerda ko‘rinadi</Empty>
      ) : (
        <div className="space-y-4">
          {logs.data.map((log) => {
            const failed = log.results.filter((r) => !r.ok).length
            return (
              <Card
                key={log.id}
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {log.title}
                    <Badge tone={failed ? 'red' : 'green'}>
                      {log.results.length - failed}/{log.results.length} yetib bordi
                    </Badge>
                  </span>
                }
                subtitle={`${KIND_LABEL[log.kind]} · ${formatDateTime(log.createdAt)}${log.byName ? ` · ${log.byName}` : ''}`}
              >
                <DeliveryResults results={log.results} />
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
