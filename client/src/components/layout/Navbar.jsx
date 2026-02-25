import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const { user, profile, isAgency } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const operatorLinks = [
    { to: '/operator/dashboard', label: 'Dashboard' },
    { to: '/operator/brief/new', label: 'Create Brief' },
    { to: '/portal/briefs', label: 'Public Portal' },
    { to: '/operator/insights', label: 'Insights' },
    { to: '/operator/settings', label: 'Settings' },
  ];

  const agencyLinks = [
    { to: '/agency/dashboard', label: 'Dashboard' },
    { to: '/agency/roster', label: 'Roster' },
    { to: '/agency/settings', label: 'Settings' },
  ];

  const links = isAgency ? agencyLinks : operatorLinks;
  const homeLink = isAgency ? '/agency/dashboard' : '/operator/dashboard';
  const profileLabel = isAgency
    ? (profile?.agencyName || 'New Agency')
    : (profile?.businessName || 'New Business');

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + Desktop Links */}
        <div className="flex items-center gap-6">
          <Link to={homeLink} className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-dark">Locale</span>
            {isAgency && (
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-200">
                Agency
              </span>
            )}
          </Link>
          <div className="hidden sm:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-dark bg-bgWarm'
                    : 'text-muted hover:text-dark hover:bg-bgWarm/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Notifications + Profile + Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-dark leading-tight">{user.name}</p>
            <p className="text-[10px] text-muted leading-tight">{profileLabel}</p>
          </div>
          <Avatar src={user.avatarUrl} name={user.name} size="sm" borderClass={isAgency ? 'border-purple-400' : 'border-accent'} />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden ml-1 p-1.5 rounded-lg text-muted hover:text-dark hover:bg-bgWarm transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-white px-4 py-2 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-dark bg-bgWarm'
                  : 'text-muted hover:text-dark hover:bg-bgWarm/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 pb-1 border-t border-border mt-2">
            <p className="text-xs font-medium text-dark px-3">{user.name}</p>
            <p className="text-[10px] text-muted px-3">{profileLabel}</p>
          </div>
        </div>
      )}
    </nav>
  );
}
