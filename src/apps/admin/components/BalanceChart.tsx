import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BorrowerData } from '@/data/types';
import { color } from '@/design-system';
import { addDays, isoDate, parseISO } from '@/lib/datetime';
import { dayMonth, inr } from '@/lib/formatters';

interface BalanceChartProps {
  borrower: BorrowerData;
  asOf: string;
  emiAmount: number;
  dueDate: string;
}

interface Point {
  date: string;
  balance: number;
  /** Only the historical (≤ asOf) portion is "actual"; the rest is faded. */
  future: boolean;
}

function dailySeries(borrower: BorrowerData, asOf: string): Point[] {
  const start = parseISO(borrower.windowStart);
  const end = parseISO(borrower.windowEnd);
  const txns = borrower.transactions;
  const points: Point[] = [];
  let lastBalance = borrower.openingBalance;
  let ti = 0;
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = addDays(d, 1)) {
    const dayStr = isoDate(d);
    while (ti < txns.length && txns[ti].date.slice(0, 10) <= dayStr) {
      lastBalance = txns[ti].balanceAfter;
      ti++;
    }
    points.push({ date: dayStr, balance: lastBalance, future: dayStr > asOf });
  }
  return points;
}

export function BalanceChart({ borrower, asOf, emiAmount, dueDate }: BalanceChartProps) {
  const data = dailySeries(borrower, asOf);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 14, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.brand} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color.brand} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={color.border} strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => dayMonth(d)}
          tick={{ fontSize: 10, fill: color.faint }}
          minTickGap={32}
          axisLine={{ stroke: color.border }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
          tick={{ fontSize: 10, fill: color.faint }}
          width={44}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ stroke: color.borderStrong }}
          contentStyle={{
            background: color.surface2,
            border: `1px solid ${color.border}`,
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: color.muted }}
          labelFormatter={(d) => dayMonth(d as string)}
          formatter={(value: number) => [inr(value), 'Balance']}
        />
        <ReferenceLine y={emiAmount} stroke={color.muted} strokeDasharray="3 3" label={{ value: `EMI ${inr(emiAmount)}`, position: 'insideTopRight', fontSize: 10, fill: color.muted }} />
        <ReferenceLine x={dueDate} stroke={color.warning} strokeDasharray="4 2" label={{ value: 'EMI due', position: 'top', fontSize: 10, fill: color.warning }} />
        <ReferenceLine x={asOf} stroke={color.brandLight} label={{ value: 'now', position: 'top', fontSize: 10, fill: color.brandLight }} />
        <Area type="monotone" dataKey="balance" stroke={color.brand} strokeWidth={2} fill="url(#balFill)" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
