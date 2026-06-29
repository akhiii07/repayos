import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Button, Logo } from '@/design-system';
import { useStoryStore } from '@/store/storyStore';
import { StoryController } from './StoryController';
import { SURFACES } from './surfaces';

export function AppShell() {
  const startTour = useStoryStore((s) => s.start);
  const location = useLocation();
  return (
    <div className="flex h-full min-h-screen">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface/60 backdrop-blur">
        <div className="px-5 py-6">
          <Logo tagline="Adaptive Collections OS" />
        </div>

        <nav className="flex-1 px-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-faint">Surfaces</p>
          <ul className="space-y-1">
            {SURFACES.map((s) => (
              <li key={s.id}>
                <NavLink
                  to={s.path}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-brand-500/15 text-ink ring-1 ring-brand-500/30'
                        : 'text-muted hover:bg-elevated hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={cn('shrink-0', isActive ? 'text-brand-400' : 'text-faint group-hover:text-muted')}>
                        {s.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium leading-tight">{s.name}</span>
                        <span className="block truncate text-[11px] text-faint">{s.description}</span>
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3 border-t border-border px-4 py-4">
          <Button variant="primary" block onClick={startTour} leftIcon={<PlayIcon />}>
            Guided tour
          </Button>
          <div className="flex items-center gap-2 px-1 text-[11px] text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Prototype · dummy data, real logic
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Suspense fallback={<PageLoader />}>
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </Suspense>
      </main>

      <StoryController />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand-400" />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
