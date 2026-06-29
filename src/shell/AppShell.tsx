import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { LogoMark } from '@/design-system';

const NAV_LINKS = [
  { path: '/partner', label: 'Partner App', description: 'Rider view' },
  { path: '/admin', label: 'Lender Console', description: 'Risk + decisions' },
  { path: '/whatsapp', label: 'WhatsApp', description: 'Conversational nudges' },
];

export function AppShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-base">
      {/* Demo top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-screen-xl items-center gap-6 px-6 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <LogoMark size={28} />
            <span className="text-[13px] font-bold text-ink">Partner Finance</span>
            <span className="ml-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning border border-warning/30">
              Prototype
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col rounded-lg px-3 py-1.5 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
                    isActive
                      ? 'bg-brand-500/10 text-brand-600'
                      : 'text-muted hover:bg-elevated hover:text-ink',
                  )
                }
              >
                <span className="text-[13px] font-semibold leading-tight">{link.label}</span>
                <span className="text-[10px] leading-tight opacity-70">{link.description}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto text-[11px] text-faint">
            Dummy data · real decision logic
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </Suspense>
      </main>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand-500" />
    </div>
  );
}
