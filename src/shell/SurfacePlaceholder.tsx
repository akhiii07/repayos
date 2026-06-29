import type { ReactNode } from 'react';
import { DeviceFrame, StatusChip } from '@/design-system';

interface SurfacePlaceholderProps {
  icon: ReactNode;
  name: string;
  description: string;
  /** Roadmap phase that delivers this surface. */
  phase: string;
  /** What this surface will contain once built. */
  willInclude: string[];
  /** Render inside a phone frame for consumer surfaces. */
  framed?: boolean;
}

function Body({ icon, name, description, phase, willInclude }: Omit<SurfacePlaceholderProps, 'framed'>) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400 [&_svg]:h-8 [&_svg]:w-8">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-ink">{name}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <StatusChip intent="warning" dot>
        {phase}
      </StatusChip>
      <ul className="mt-2 space-y-1.5 text-left text-sm text-muted">
        {willInclude.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-faint" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SurfacePlaceholder({ framed = false, ...body }: SurfacePlaceholderProps) {
  if (framed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <DeviceFrame caption={`${body.name} · ${body.phase}`}>
          <Body {...body} />
        </DeviceFrame>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center rounded-card border border-dashed border-border bg-surface/40">
        <Body {...body} />
      </div>
    </div>
  );
}
