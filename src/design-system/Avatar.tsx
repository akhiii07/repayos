import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  /** Hex color for the ring/tint. */
  color: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, color, size = 40, className }: AvatarProps) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}55`,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
