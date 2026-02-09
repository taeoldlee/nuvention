import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import OperatorOnboarding from './pages/operator/Onboarding';
import OperatorDashboard from './pages/operator/Dashboard';
import NewRequest from './pages/operator/NewRequest';
import MatchDetail from './pages/operator/MatchDetail';
import OperatorProjectView from './pages/operator/ProjectView';
import Library from './pages/operator/Library';
import OperatorSettings from './pages/operator/Settings';
import CreatorOnboarding from './pages/creator/Onboarding';
import CreatorDashboard from './pages/creator/Dashboard';
import CreatorSettings from './pages/creator/Settings';
import BriefDetail from './pages/creator/BriefDetail';
import CreatorProjectView from './pages/creator/ProjectView';
import { useAuth } from './contexts/AuthContext';

function HomeRedirect() {
  const { user, isOperator } = useAuth();
  if (!user) return <Landing />;
  return <Navigate to={isOperator ? '/operator/dashboard' : '/creator/dashboard'} replace />;
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
        <Route path="/operator/request/new" element={<NewRequest />} />
        <Route path="/operator/request/:id" element={<NewRequest />} />
        <Route path="/operator/match/:matchId" element={<MatchDetail />} />
        <Route path="/operator/project/:id" element={<OperatorProjectView />} />
        <Route path="/operator/library" element={<Library />} />
        <Route path="/operator/settings" element={<OperatorSettings />} />

        {/* Creator Routes */}
        <Route path="/creator/onboarding" element={<CreatorOnboarding />} />
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/creator/brief/:matchId" element={<BriefDetail />} />
        <Route path="/creator/project/:id" element={<CreatorProjectView />} />
        <Route path="/creator/settings" element={<CreatorSettings />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
