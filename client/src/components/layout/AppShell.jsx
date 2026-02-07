import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DemoSwitcher from './DemoSwitcher';
import { useAuth } from '../../contexts/AuthContext';

export default function AppShell() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bgTan">
      {user && <Navbar />}
      <main className={user ? 'pt-16' : ''}>
        <Outlet />
      </main>
      <DemoSwitcher />
    </div>
  );
}
