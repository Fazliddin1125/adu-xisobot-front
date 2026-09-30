import { AlarmClock, CalendarDays, Check, Hourglass } from 'lucide-react'
import { deadlineText } from '../../lib/humanize'
import { Badge } from '../ui'

const TONE = { late: 'red', soon: 'amber', ok: 'slate', done: 'green' } as const
const ICON = { late: AlarmClock, soon: Hourglass, ok: CalendarDays, done: Check } as const

/** "Ertaga", "3 kun qoldi", "2 kun kechikdi" ko'rinishidagi muddat tegi */
export function DeadlineChip({ deadline, done }: { deadline: string; done: boolean }) {
  const { text, tone } = deadlineText(deadline, done)
  const Icon = ICON[tone]
  return (
    <Badge tone={TONE[tone]}>
      <Icon className="size-3.5" strokeWidth={2.2} aria-hidden />
      {text}
    </Badge>
  )
}
