import { currentMonthKey, isDay, monthLabel, recentMonths, todayKey, type PeriodValue } from '../lib/period'
import { Input, Segmented, Select } from './ui'

const PRESETS = [
  { value: 'today', label: 'Bugun' },
  { value: 'yesterday', label: 'Kecha' },
  { value: 'week', label: 'Shu hafta' },
  { value: 'month', label: 'Shu oy' },
]

/** Davr: tayyor tugmalar, kalendardan aniq kun yoki boshqa oy */
export function PeriodPicker({ value, onChange }: { value: PeriodValue; onChange: (v: PeriodValue) => void }) {
  const isMonth = /^\d{4}-\d{2}$/.test(value)
  const current = currentMonthKey()
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Segmented label="Davr" options={PRESETS} value={isMonth || isDay(value) ? null : value} onChange={onChange} />
      <Input
        type="date"
        aria-label="Kunni tanlash"
        title="Kunni tanlash"
        className="sm:w-40"
        max={todayKey()}
        value={isDay(value) ? value : ''}
        onChange={(e) => onChange(e.target.value || 'today')}
      />
      <Select
        aria-label="Oyni tanlash"
        className="sm:w-44"
        value={isMonth ? value : ''}
        onChange={(e) => onChange(e.target.value || 'month')}
      >
        <option value="">Boshqa oy…</option>
        {recentMonths(24)
          .filter((m) => m !== current)
          .map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
      </Select>
    </div>
  )
}
