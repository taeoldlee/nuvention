import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import OperatorOnboarding from './pages/operator/Onboarding';
import OperatorDashboard from './pages/operator/Dashboard';
import CreateBrief from './pages/operator/CreateBrief';
import BriefDetail from './pages/operator/BriefDetail';
import OperatorProjectView from './pages/operator/ProjectView';
import AllBriefs from './pages/operator/AllBriefs';
import AllProjects from './pages/operator/AllProjects';
import OperatorSettings from './pages/operator/Settings';
import InsightsPage from './pages/operator/InsightsPage';
import Payments from './pages/operator/Payments';
import BriefPortal from './pages/portal/BriefPortal';
import ApplicationStatus from './pages/portal/ApplicationStatus';
import CreatorProjectPage from './pages/portal/CreatorProjectPage';
import { useAuth } from './contexts/AuthContext';

function HomeRedirect() {
  const { user, hasProfile } = useAuth();
  if (!user) return <Landing />;
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
        <Route path="/operator/briefs" element={<AllBriefs />} />
        <Route path="/operator/projects" element={<AllProjects />} />
        <Route path="/operator/brief/new" element={<CreateBrief />} />
        <Route path="/operator/brief/:id" element={<BriefDetail />} />
        <Route path="/operator/project/:id" element={<OperatorProjectView />} />
        <Route path="/operator/settings" element={<OperatorSettings />} />
        <Route path="/operator/insights" element={<InsightsPage />} />
        <Route path="/operator/payments" element={<Payments />} />

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
