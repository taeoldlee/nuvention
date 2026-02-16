import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, profile, isOperator, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const operatorLinks = [
    { to: '/operator/dashboard', label: 'Dashboard' },
    { to: '/operator/request/new', label: 'New Request' },
    { to: '/operator/library', label: 'Library' },
    { to: '/operator/settings', label: 'Settings' },
  ];

  const creatorLinks = [
    { to: '/creator/dashboard', label: 'Dashboard' },
    { to: '/creator/settings', label: 'Settings' },
  ];

  const links = isOperator ? operatorLinks : creatorLinks;
  const homePath = isOperator ? '/operator/dashboard' : '/creator/dashboard';
  const accentBorder = isOperator ? 'border-accent' : 'border-creatorAccent';

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to={homePath} className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-dark">Locale</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
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
              {isOperator
                ? profile?.businessName || 'New Business'
                : profile?.displayName || 'New Creator'}
            </p>
          </div>
          <div className={`w-9 h-9 rounded-full overflow-hidden border-2 ${accentBorder}`}>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full bg-bgWarm flex items-center justify-center text-sm font-bold text-muted">
                {user.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
