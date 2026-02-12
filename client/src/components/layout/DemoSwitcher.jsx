import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { reseedDatabase } from '../../api';

export default function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const [reseedLoading, setReseedLoading] = useState(false);
  const { demoUsers, user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open when #demo hash is present
  useEffect(() => {
    if (location.hash === '#demo') {
      setOpen(true);
    }
  }, [location.hash]);

  const handleReseed = async () => {
    if (!window.confirm('This will reset all demo data to its starting state. Continue?')) {
      return;
    }
    setReseedLoading(true);
    try {
      await reseedDatabase();
      localStorage.removeItem('locale_user_id');
      window.location.href = '/';
    } catch (err) {
      console.error('Reseed failed:', err);
      alert('Failed to reset demo data. Please try again.');
      setReseedLoading(false);
    }
  };

  const allOperators = demoUsers.filter((u) => u.role === 'OPERATOR');
  const allCreators = demoUsers.filter((u) => u.role === 'CREATOR');
  const newOperators = allOperators.filter((u) => !u.brandProfile);
  const existingOperators = allOperators.filter((u) => u.brandProfile);
  const newCreators = allCreators.filter((u) => !u.creatorProfile);
  const existingCreators = allCreators.filter((u) => u.creatorProfile);

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


  return (
    <>
      {/* Floating trigger button */}
      <button
        data-demo-trigger
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
          <div
            role="dialog"
            aria-label="Demo account switcher"
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
            className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-bgWarm">
              <h3 className="font-display text-lg font-bold text-dark">Demo Accounts</h3>
              <p className="text-xs text-muted mt-0.5">
                Switch between users to explore different flows
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {/* New Accounts */}
              {(newOperators.length > 0 || newCreators.length > 0) && (
                <div className="p-3 pb-1">
                  <p className="text-xs font-semibold text-accent uppercase tracking-wider px-2 mb-2">
                    + Create New Account
                  </p>
                  {newOperators.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => handleSelect(op)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors mb-1 ${
                        user?.id === op.id
                          ? 'bg-accentLight border border-accent/20'
                          : 'bg-accent/5 hover:bg-accent/10 border border-accent/10'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-accentLight flex items-center justify-center text-accent font-bold flex-shrink-0 border-2 border-accent/30">
                        +
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">{op.name}</p>
                        <p className="text-xs text-accent font-medium">New Business</p>
                      </div>
                    </button>
                  ))}
                  {newCreators.map((cr) => (
                    <button
                      key={cr.id}
                      onClick={() => handleSelect(cr)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors mb-1 ${
                        user?.id === cr.id
                          ? 'bg-creatorLight border border-creator/20'
                          : 'bg-creator/5 hover:bg-creator/10 border border-creator/10'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-creatorLight flex items-center justify-center text-creator font-bold flex-shrink-0 border-2 border-creator/30">
                        +
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">{cr.name}</p>
                        <p className="text-xs text-creator font-medium">New Creator</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Operators */}
              <div className="p-3">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-2">
                  Operators
                </p>
                {existingOperators.map((op) => (
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
                          onError={(e) => { e.target.src = ''; }}
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
                      <p className="text-xs text-muted">Returning</p>
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
                {existingCreators.map((cr) => (
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
                          onError={(e) => { e.target.src = ''; }}
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
                      <p className="text-xs text-muted">Returning</p>
                    </div>
                    {user?.id === cr.id && (
                      <div className="w-2 h-2 rounded-full bg-creator flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Demo Data */}
            <div className="p-3 border-t border-border">
              <button
                onClick={handleReseed}
                disabled={reseedLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reseedLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Resetting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Demo Data
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
