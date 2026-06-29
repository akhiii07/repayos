import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/shell/AppShell';

// Lazy-load each surface so the chart-heavy admin (Recharts) and the
// animation-heavy consumer apps (framer-motion) split into on-demand chunks,
// keeping the initial bundle lean.
const Showcase = lazy(() => import('@/showcase/Showcase').then((m) => ({ default: m.Showcase })));
const AdminApp = lazy(() => import('@/apps/admin/AdminApp').then((m) => ({ default: m.AdminApp })));
const LendingApp = lazy(() => import('@/apps/lending/LendingApp').then((m) => ({ default: m.LendingApp })));
const GigApp = lazy(() => import('@/apps/gig/GigApp').then((m) => ({ default: m.GigApp })));
const WhatsappApp = lazy(() => import('@/apps/whatsapp/WhatsappApp').then((m) => ({ default: m.WhatsappApp })));

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/showcase" replace />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/lending" element={<LendingApp />} />
        <Route path="/gig" element={<GigApp />} />
        <Route path="/whatsapp" element={<WhatsappApp />} />
        <Route path="*" element={<Navigate to="/showcase" replace />} />
      </Route>
    </Routes>
  );
}
