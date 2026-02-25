import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const { user, profile, isAgency } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const operatorLinks = [
    { to: '/operator/dashboard', label: 'Dashboard' },
    { to: '/operator/brief/new', label: 'Create Brief' },
    { to: '/portal/briefs', label: 'Public Portal' },
    { to: '/operator/settings', label: 'Settings' },
  ];

  const agencyLinks = [
    { to: '/agency/dashboard', label: 'Dashboard' },
    { to: '/agency/roster', label: 'Roster' },
    { to: '/portal/briefs', label: 'Public Portal' },
    { to: '/agency/settings', label: 'Settings' },
  ];

  const links = isAgency ? agencyLinks : operatorLinks;
  const homeLink = isAgency ? '/agency/dashboard' : '/operator/dashboard';
  const profileLabel = isAgency
    ? (profile?.agencyName || 'New Agency')
    : (profile?.businessName || 'New Business');

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to={homeLink} className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-dark">Locale</span>
            {isAgency && (
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Agency
              </span>
            )}
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
            <p className="text-xs text-muted">{profileLabel}</p>
          </div>
          <Avatar src={user.avatarUrl} name={user.name} borderClass={isAgency ? 'border-purple-400' : 'border-accent'} />
        </div>
      </div>
    </nav>
  );
}
