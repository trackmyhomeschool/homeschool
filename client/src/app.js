import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import DailyLogs from './pages/DailyLogs';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import TranscriptPreview from './pages/TranscriptPreview';
import HomeschoolMapPage from './pages/HomeschoolMapPage';
import ActivitiesPage from './pages/ActivitiesPage';
import AdminLoginPage from './pages/admin//AdminLoginPage';
import UpgradePremiumPage from './pages/UpgradePremiumPage';
import StateRequirementsPage from './pages/StateRequirementsPage';
import ContactChatPage from './pages/ContactChatPage';
import AdminDashboardLayout from './components/admin/AdminDashboardLayout';
import UsersPage from './pages/admin/UsersPage';
import AdminAllChatsPage from './pages/admin/AdminAllChatsPage';
import AdminChatPage from './pages/admin/AdminChatPage';

import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminStatesPage from './pages/admin/AdminStatesPage';
import AdminEditStatePage from "./pages/admin/AdminEditStatePage";
import AdminResourceManagerPage from './pages/admin/AdminResourceManagerPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/logs" element={<DailyLogs />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/transcript/:id" element={<TranscriptPreview />} />
        <Route path="/map" element={<HomeschoolMapPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/upgrade" element={<UpgradePremiumPage />} />
        <Route path="/contact" element={<ContactChatPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/requirements" element={<StateRequirementsPage />} />

      <Route path="/admin" element={<AdminDashboardLayout />}>
          <Route path="users" element={<UsersPage />} />
          <Route path="states/:id/edit" element={<AdminEditStatePage/>} />
          <Route path="resources" element={<AdminResourceManagerPage/>} />
          <Route path="states" element={<AdminStatesPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="support" element={<AdminAllChatsPage />} />
          <Route path="support/:username" element={<AdminChatPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
