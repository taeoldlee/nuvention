import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const { demoUsers, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open when #demo hash is present
  useEffect(() => {
    if (location.hash === '#demo') {
      setOpen(true);
    }
  }, [location.hash]);

  const allOperators = demoUsers.filter((u) => u.role === 'OPERATOR');
  const allCreators = demoUsers.filter((u) => u.role === 'CREATOR');
  // Show new accounts first so they're easy to find
  const operators = [...allOperators.filter((u) => !u.brandProfile), ...allOperators.filter((u) => u.brandProfile)];
  const creators = [...allCreators.filter((u) => !u.creatorProfile), ...allCreators.filter((u) => u.creatorProfile)];

  const handleSelect = async (demoUser) => {
    try {
      const data = await login(demoUser.id);
      setOpen(false);

      if (demoUser.role === 'OPERATOR') {
        if (data.profile) {
          navigate('/operator/dashboard');
        } else {
          navigate('/operator/onboarding');
        }
      } else {
        if (data.profile) {
          navigate('/creator/dashboard');
        } else {
          navigate('/creator/onboarding');
        }
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  const getStatusText = (demoUser) => {
    if (demoUser.role === 'OPERATOR') {
      if (!demoUser.brandProfile) return 'New user';
      return 'Returning';
    }
    if (!demoUser.creatorProfile) return 'New user';
    return 'Returning';
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-dark text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-dark/90 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Demo
      </button>

      {/* Overlay + Panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-bgWarm">
              <h3 className="font-display text-lg font-bold text-dark">Demo Accounts</h3>
              <p className="text-xs text-muted mt-0.5">
                Switch between users to explore different flows
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {/* Operators */}
              <div className="p-3">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-2">
                  Operators
                </p>
                {operators.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => handleSelect(op)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                      user?.id === op.id
                        ? 'bg-accentLight border border-accent/20'
                        : 'hover:bg-bgWarm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/30 flex-shrink-0">
                      {op.avatarUrl ? (
                        <img
                          src={op.avatarUrl}
                          alt={op.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-accentLight flex items-center justify-center text-accent font-bold">
                          {op.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark truncate">
                        {op.brandProfile?.businessName || op.name}
                      </p>
                      <p className="text-xs text-muted">{getStatusText(op)}</p>
                    </div>
                    {user?.id === op.id && (
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Creators */}
              <div className="p-3 pt-0">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-2">
                  Creators
                </p>
                {creators.map((cr) => (
                  <button
                    key={cr.id}
                    onClick={() => handleSelect(cr)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                      user?.id === cr.id
                        ? 'bg-creatorLight border border-creator/20'
                        : 'hover:bg-bgWarm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-creator/30 flex-shrink-0">
                      {cr.avatarUrl ? (
                        <img
                          src={cr.avatarUrl}
                          alt={cr.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-creatorLight flex items-center justify-center text-creator font-bold">
                          {cr.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark truncate">
                        {cr.creatorProfile?.displayName || cr.name}
                      </p>
                      <p className="text-xs text-muted">{getStatusText(cr)}</p>
                    </div>
                    {user?.id === cr.id && (
                      <div className="w-2 h-2 rounded-full bg-creator flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Demo */}
            {user && (
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Reset Demo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
