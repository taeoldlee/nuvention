import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Btn from '../../components/common/Btn';

export default function AgencySettings() {
  const navigate = useNavigate();
  const { user, profile, isAgency, hasProfile, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded-xl w-48" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAgency) return <Navigate to="/" replace />;
  if (!hasProfile) return <Navigate to="/agency/onboarding" replace />;

  const specialties = Array.isArray(profile.specialties) ? profile.specialties : [];

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-dark mb-1">Settings</h1>
            <p className="font-body text-muted text-sm">Your agency profile at a glance.</p>
          </div>
          <Btn variant="ghost" onClick={() => navigate('/agency/dashboard')}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </Btn>
        </div>

        {/* Agency Profile Card */}
        <div className="card space-y-6">
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Agency Name</p>
            <p className="text-lg font-semibold text-dark font-display">{profile.agencyName || '--'}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Contact Name</p>
              <p className="text-sm text-dark font-body">{profile.contactName || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Contact Email</p>
              <p className="text-sm text-dark font-body">{profile.contactEmail || '--'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Agency Type</p>
            <p className="text-sm text-dark font-body">{profile.agencyType || '--'}</p>
          </div>

          {profile.serviceArea && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Service Area</p>
              <p className="text-sm text-dark font-body">{profile.serviceArea}</p>
            </div>
          )}

          {profile.bio && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Bio</p>
              <p className="text-sm text-dark font-body">{profile.bio}</p>
            </div>
          )}

          {profile.websiteUrl && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Website</p>
              <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline font-body">
                {profile.websiteUrl}
              </a>
            </div>
          )}

          {specialties.length > 0 && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="card mt-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-dark">Account</h2>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Name</p>
            <p className="text-sm text-dark font-body">{user?.name || '--'}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-dark font-body">{user?.email || '--'}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Role</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Agency
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
