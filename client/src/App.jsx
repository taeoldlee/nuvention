import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import OperatorOnboarding from './pages/operator/Onboarding';
import OperatorDashboard from './pages/operator/Dashboard';
import CreateBrief from './pages/operator/CreateBrief';
import BriefDetail from './pages/operator/BriefDetail';
import OperatorProjectView from './pages/operator/ProjectView';
import OperatorSettings from './pages/operator/Settings';
import InsightsPage from './pages/operator/InsightsPage';
import Payments from './pages/operator/Payments';
import BriefPortal from './pages/portal/BriefPortal';
import ApplicationStatus from './pages/portal/ApplicationStatus';
import CreatorProjectPage from './pages/portal/CreatorProjectPage';
import AgencyOnboarding from './pages/agency/Onboarding';
import AgencyDashboard from './pages/agency/Dashboard';
import AgencyBriefDetail from './pages/agency/BriefDetail';
import AgencyRoster from './pages/agency/Roster';
import AgencySettings from './pages/agency/Settings';
import { useAuth } from './contexts/AuthContext';

function HomeRedirect() {
  const { user, isAgency, hasProfile } = useAuth();
  if (!user) return <Landing />;
  if (isAgency) {
    return hasProfile
      ? <Navigate to="/agency/dashboard" replace />
      : <Navigate to="/agency/onboarding" replace />;
  }
  if (!hasProfile) {
    return <Navigate to="/operator/onboarding" replace />;
  }
  return <Navigate to="/operator/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Landing (or redirect to dashboard if logged in) */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Operator Routes */}
        <Route path="/operator/onboarding" element={<OperatorOnboarding />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/operator/brief/new" element={<CreateBrief />} />
        <Route path="/operator/brief/:id" element={<BriefDetail />} />
        <Route path="/operator/project/:id" element={<OperatorProjectView />} />
        <Route path="/operator/settings" element={<OperatorSettings />} />
        <Route path="/operator/insights" element={<InsightsPage />} />
        <Route path="/operator/payments" element={<Payments />} />

        {/* Agency Routes */}
        <Route path="/agency/onboarding" element={<AgencyOnboarding />} />
        <Route path="/agency/dashboard" element={<AgencyDashboard />} />
        <Route path="/agency/brief/:id" element={<AgencyBriefDetail />} />
        <Route path="/agency/roster" element={<AgencyRoster />} />
        <Route path="/agency/settings" element={<AgencySettings />} />

        {/* Public Portal (no auth required) */}
        <Route path="/portal/briefs" element={<BriefPortal />} />
        <Route path="/portal/briefs/:id" element={<BriefPortal />} />
        <Route path="/portal/application/:token" element={<ApplicationStatus />} />
        <Route path="/portal/project/:id" element={<CreatorProjectPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
