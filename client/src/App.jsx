import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import OperatorOnboarding from './pages/operator/Onboarding';
import OperatorDashboard from './pages/operator/Dashboard';
import NewRequest from './pages/operator/NewRequest';
import MatchDetail from './pages/operator/MatchDetail';
import OperatorProjectView from './pages/operator/ProjectView';
import Library from './pages/operator/Library';
import CreatorOnboarding from './pages/creator/Onboarding';
import CreatorDashboard from './pages/creator/Dashboard';
import BriefDetail from './pages/creator/BriefDetail';
import CreatorProjectView from './pages/creator/ProjectView';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Operator Routes */}
        <Route path="/operator/onboarding" element={<OperatorOnboarding />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/operator/request/new" element={<NewRequest />} />
        <Route path="/operator/request/:id" element={<NewRequest />} />
        <Route path="/operator/match/:matchId" element={<MatchDetail />} />
        <Route path="/operator/project/:id" element={<OperatorProjectView />} />
        <Route path="/operator/library" element={<Library />} />

        {/* Creator Routes */}
        <Route path="/creator/onboarding" element={<CreatorOnboarding />} />
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/creator/brief/:matchId" element={<BriefDetail />} />
        <Route path="/creator/project/:id" element={<CreatorProjectView />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
