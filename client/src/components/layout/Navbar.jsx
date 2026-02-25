import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const links = [
    { to: '/operator/dashboard', label: 'Dashboard' },
    { to: '/operator/brief/new', label: 'Create Brief' },
    { to: '/portal/briefs', label: 'Public Portal' },
    { to: '/operator/settings', label: 'Settings' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/operator/dashboard" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-dark">Locale</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to || location.pathname.startsWith(link.to + '/')
                    ? `text-dark bg-bgWarm`
                    : 'text-muted hover:text-dark hover:bg-bgWarm/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-dark">{user.name}</p>
            <p className="text-xs text-muted">
              {profile?.businessName || 'New Business'}
            </p>
          </div>
          <Avatar src={user.avatarUrl} name={user.name} borderClass="border-accent" />
        </div>
      </div>
    </nav>
  );
}
