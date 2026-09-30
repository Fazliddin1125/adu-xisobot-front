import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { shortDay } from '../../lib/period'

interface Point {
  date: string
  count: number
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Point }> }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-slate-500">{p.date.split('-').reverse().join('.')}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{p.count} ta ish</p>
    </div>
  )
}

/** Kunlar kesimida murojaatlar soni (bitta seriya) */
export function DailyChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDay}
            tick={{ fontSize: 11, fill: '#898781' }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(42,120,214,0.08)' }} />
          <Bar dataKey="count" fill="var(--color-series-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
