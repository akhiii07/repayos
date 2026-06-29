import type { ReactNode } from 'react';

/** A surface is one of the apps the RepayOS shell can switch between. */
export interface Surface {
  id: string;
  /** Route path (without leading group). */
  path: string;
  /** Sidebar label. */
  name: string;
  /** One-line description for the sidebar / landing. */
  description: string;
  /**
   * Layout kind:
   *  - 'consumer': rendered inside a phone DeviceFrame
   *  - 'desktop': full-width lender console
   *  - 'page': full-width utility page (e.g. design system showcase)
   */
  kind: 'consumer' | 'desktop' | 'page';
  icon: ReactNode;
}

const icon = (path: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {path}
  </svg>
);

export const SURFACES: Surface[] = [
  {
    id: 'showcase',
    path: '/showcase',
    name: 'Design System',
    description: 'Primitives, tokens & components',
    kind: 'page',
    icon: icon(
      <>
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="10.5" r="2.5" />
        <circle cx="8.5" cy="7.5" r="2.5" />
        <circle cx="6.5" cy="12.5" r="2.5" />
        <path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 2-2 2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-10Z" />
      </>,
    ),
  },
  {
    id: 'admin',
    path: '/admin',
    name: 'Lender Console',
    description: 'Decision engine & cohort view',
    kind: 'desktop',
    icon: icon(
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </>,
    ),
  },
  {
    id: 'lending',
    path: '/lending',
    name: 'Borrower App',
    description: 'Repayment dashboard & progress',
    kind: 'consumer',
    icon: icon(
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </>,
    ),
  },
  {
    id: 'gig',
    path: '/gig',
    name: 'Gig App',
    description: 'Earnings & repayment allocation',
    kind: 'consumer',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9.5a2.5 2 0 0 1 5 0c0 1.5-1.5 1.8-2 2.5-.3.4-.5.8-.5 1.5M12 17h.01" />
      </>,
    ),
  },
  {
    id: 'whatsapp',
    path: '/whatsapp',
    name: 'WhatsApp',
    description: 'Conversational nudges & one-tap pay',
    kind: 'consumer',
    icon: icon(
      <>
        <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
      </>,
    ),
  },
];

export const DEFAULT_SURFACE = SURFACES[0];
