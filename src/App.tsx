import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/shell/AppShell';

const PartnerApp = lazy(() => import('@/apps/partner/PartnerApp').then((m) => ({ default: m.PartnerApp })));
const AdminApp = lazy(() => import('@/apps/admin/AdminApp').then((m) => ({ default: m.AdminApp })));
const WhatsappApp = lazy(() => import('@/apps/whatsapp/WhatsappApp').then((m) => ({ default: m.WhatsappApp })));

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/partner" replace />} />
        <Route path="/partner/*" element={<PartnerApp />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/whatsapp" element={<WhatsappApp />} />
        <Route path="*" element={<Navigate to="/partner" replace />} />
      </Route>
    </Routes>
  );
}
