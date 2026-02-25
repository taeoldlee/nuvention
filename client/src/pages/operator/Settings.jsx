import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-muted font-body mb-4">No brand profile found.</p>
            <Btn onClick={() => navigate('/operator/onboarding')}>Set Up Profile</Btn>
          </div>
        </div>
      </div>
    );
  }

  const vibes = Array.isArray(profile.vibe) ? profile.vibe : [];
  const values = Array.isArray(profile.values) ? profile.values : [];
  const cuisineTypes = Array.isArray(profile.cuisineTypes) ? profile.cuisineTypes : [];

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-dark mb-1">Settings</h1>
            <p className="font-body text-muted text-sm">Your brand profile at a glance.</p>
          </div>
          <Btn variant="ghost" onClick={() => navigate('/operator/dashboard')}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </Btn>
        </div>

        {/* Profile Card */}
        <div className="card space-y-6">

          {/* Business Name */}
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Business Name</p>
            <p className="text-lg font-semibold text-dark font-display">
              {profile.businessName || '--'}
            </p>
          </div>

          {/* Neighborhood */}
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Neighborhood</p>
            <p className="text-sm text-dark font-body">
              {profile.neighborhood || '--'}
              {profile.city && `, ${profile.city}`}
              {profile.state && `, ${profile.state}`}
            </p>
          </div>

          {/* Cuisine Types */}
          {cuisineTypes.length > 0 && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">Cuisine Types</p>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vibe Tags */}
          {vibes.length > 0 && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">Vibe</p>
              <div className="flex flex-wrap gap-2">
                {vibes.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-bgTan text-mid border border-border"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Values */}
          {values.length > 0 && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">Values</p>
              <div className="flex flex-wrap gap-2">
                {values.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-bgTan text-mid border border-border"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subscription Info */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Plan</p>
            <p className="text-sm text-dark font-body">
              {profile.subscriptionTier || 'BASIC'}{' '}
              <span className="text-muted">
                ({profile.subscriptionStatus || 'TRIAL'})
              </span>
            </p>
          </div>

          {/* Edit Profile Link */}
          <div className="border-t border-border pt-4 flex justify-end">
            <Btn onClick={() => navigate('/operator/onboarding')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Update Profile
            </Btn>
          </div>
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
            <p className="text-sm text-dark font-body">{user?.role || '--'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
