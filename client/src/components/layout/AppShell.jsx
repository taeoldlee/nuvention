import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import DemoSwitcher from './DemoSwitcher';
import { useAuth } from '../../contexts/AuthContext';

export default function AppShell() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isOnboarding = pathname.includes('/onboarding');
  const showNav = user && !isOnboarding;

  return (
    <div className="min-h-screen bg-bgTan">
      {showNav && <Navbar />}
      <main className={showNav ? 'pt-14' : ''}>
        <Outlet />
      </main>
      <DemoSwitcher />
    </div>
  );
}
