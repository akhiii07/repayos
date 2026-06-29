import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { BorrowerData } from '@/data/types';
import { color } from '@/design-system';
import { addDays, isoDate, parseISO } from '@/lib/datetime';
import { inr } from '@/lib/formatters';

interface Day {
  date: string;
  label: string;
  earnings: number;
  isToday: boolean;
}

function weeklyData(borrower: BorrowerData, asOf: string): Day[] {
  const byDate = new Map(borrower.earnings.map((e) => [e.date, e.grossEarnings]));
  const end = parseISO(asOf);
  const out: Day[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(end, -i);
    const ds = isoDate(d);
    out.push({
      date: ds,
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 1),
      earnings: byDate.get(ds) ?? 0,
      isToday: i === 0,
    });
  }
  return out;
}

export function EarningsBarChart({ borrower, asOf }: { borrower: BorrowerData; asOf: string }) {
  const data = weeklyData(borrower, asOf);
  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: color.faint }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: `${color.brand}14` }}
          contentStyle={{ background: color.surface2, border: `1px solid ${color.border}`, borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: color.muted }}
          formatter={(value: number) => [inr(value), 'Earned']}
          labelFormatter={() => ''}
        />
        <Bar dataKey="earnings" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((d) => (
            <Cell key={d.date} fill={d.isToday ? color.brand : color.borderStrong} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
