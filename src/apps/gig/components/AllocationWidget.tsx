import { useState } from 'react';
import { Button, LogoMark, ProgressBar } from '@/design-system';
import { inr } from '@/lib/formatters';

interface AllocationWidgetProps {
  emi: number;
  /** Max the worker can set aside right now (capped by balance and the EMI). */
  available: number;
  /** Pre-filled suggested amount. */
  suggested: number;
  daysUntilDue: number;
  dueLabel: string;
  onConfirm: (amount: number) => void;
}

export function AllocationWidget({ emi, available, suggested, daysUntilDue, dueLabel, onConfirm }: AllocationWidgetProps) {
  const [amount, setAmount] = useState(Math.min(suggested, available));
  const fundedPct = Math.round((amount / emi) * 100);
  const remaining = Math.max(0, emi - amount);

  return (
    <div className="rounded-card border border-brand-500/40 bg-surface-2 p-5">
      <div className="mb-3 flex items-center gap-2">
        <LogoMark size={22} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">RepayOS · set aside for your EMI</p>
          <p className="text-xs text-faint">Turn today’s earnings into an EMI head-start</p>
        </div>
      </div>

      <div className="mb-1 flex items-baseline justify-between">
        <span className="tnum text-3xl font-extrabold text-ink">{inr(amount)}</span>
        <span className="text-xs text-muted">of {inr(emi)} EMI</span>
      </div>

      <input
        type="range"
        min={0}
        max={available}
        step={50}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="my-3 w-full accent-brand-500"
        aria-label="Amount to set aside"
      />

      <ProgressBar value={amount} max={emi} intent={fundedPct >= 100 ? 'success' : 'brand'} />
      <p className="mt-1.5 text-xs text-muted">
        <span className="font-semibold text-ink">{fundedPct}%</span> funded
        {remaining > 0 ? ` · ${inr(remaining)} to go` : ' · fully covered 🎉'}
      </p>

      {available > 0 && daysUntilDue > 0 && (
        <p className="mt-2 text-[11px] text-faint">
          Tip: set aside about {inr(Math.min(available, Math.ceil(emi / daysUntilDue / 50) * 50))}/day to be ready by {dueLabel}.
        </p>
      )}

      <Button variant="primary" block className="mt-4" disabled={amount <= 0} onClick={() => onConfirm(amount)}>
        Set aside {inr(amount)}
      </Button>
    </div>
  );
}
