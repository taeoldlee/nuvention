import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicationStatus } from '../../api';

// ─── Constants ───

const CAMPAIGN_GOAL_LABELS = {
  EVENT_PROMO: 'Event Promo',
  MENU_LAUNCH: 'Menu Launch',
  SEASONAL_SPECIAL: 'Seasonal Special',
  GENERAL_CONTENT: 'General Content',
  GRAND_OPENING: 'Grand Opening',
  SLOW_PERIOD_FILL: 'Slow Period Fill',
};

const COMPENSATION_LABELS = {
  FREE_PRODUCT: 'Free Product',
  FLAT_FEE: 'Flat Fee',
  HYBRID: 'Hybrid',
  COMMISSION: 'Commission',
};

function formatDeadline(dateStr) {
  if (!dateStr) return 'Flexible';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCompensation(brief) {
  const type = COMPENSATION_LABELS[brief.compensationType] || brief.compensationType;
  if (brief.compensationAmount) {
    return `${type} -- $${(brief.compensationAmount / 100).toFixed(0)}`;
  }
  return type;
}

// ─── Status Config ───

const STATUS_CONFIG = {
  PENDING: {
    label: 'Under Review',
    color: 'text-yellowText',
    bg: 'bg-yellowBg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    heading: 'Your application is under review',
    description: 'The brand is reviewing applications. You will be able to see your updated status on this page.',
  },
  SELECTED: {
    label: 'Accepted',
    color: 'text-green',
    bg: 'bg-greenBg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    heading: 'You have been selected!',
    description: 'The brand chose you for this project. Click below to view and accept the project.',
  },
  REJECTED: {
    label: 'Not Selected',
    color: 'text-muted',
    bg: 'bg-bgWarm',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    heading: 'Not selected this time',
    description: 'The brand went in a different direction for this brief. Keep applying -- new opportunities are posted regularly!',
  },
  DECLINED: {
    label: 'Declined',
    color: 'text-muted',
    bg: 'bg-bgWarm',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    heading: 'You declined this project',
    description: 'You chose to pass on this project.',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    color: 'text-muted',
    bg: 'bg-bgWarm',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    heading: 'Application withdrawn',
    description: 'This application has been withdrawn.',
  },
};

// ─── Main Component ───

export default function ApplicationStatus() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    getApplicationStatus(token)
      .then((res) => setData(res.data.application))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Application not found. Please check your link.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-border rounded mx-auto" />
            <div className="card py-12">
              <div className="w-16 h-16 rounded-full bg-border mx-auto mb-4" />
              <div className="h-6 w-64 bg-border rounded mx-auto mb-2" />
              <div className="h-4 w-48 bg-border rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="card text-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-50 mx-auto mb-4 flex items-center justify-center text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-dark mb-2">Oops</h2>
            <p className="text-muted font-body mb-6">{error}</p>
            <Link
              to="/portal/briefs"
              className="inline-flex items-center justify-center font-body font-semibold transition-all duration-300 rounded-xl px-6 py-3 text-base border-2 border-border bg-white hover:bg-bgWarm text-mid hover:shadow-sm"
            >
              Browse Open Briefs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.PENDING;
  const brief = data.brief;
  const project = data.project;
  const appliedDate = new Date(data.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-accent font-semibold font-body uppercase tracking-wider mb-2">Application Status</p>
          <h1 className="font-display text-2xl font-bold text-dark">
            {brief.title}
          </h1>
          <p className="text-sm text-muted font-body mt-1">
            {brief.brandProfile?.businessName}
            {brief.brandProfile?.neighborhood && ` \u00B7 ${brief.brandProfile.neighborhood}`}
            {brief.brandProfile?.city && `, ${brief.brandProfile.city}`}
          </p>
        </div>

        {/* Status Card */}
        <div className="card mb-6">
          <div className="text-center py-6">
            <div className={`w-16 h-16 rounded-full ${config.bg} mx-auto mb-4 flex items-center justify-center ${config.color}`}>
              {config.icon}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.color} mb-3`}>
              {config.label}
            </div>
            <h2 className="font-display text-xl font-bold text-dark mb-2">{config.heading}</h2>
            <p className="text-muted font-body max-w-sm mx-auto text-sm">{config.description}</p>
          </div>

          {/* Project link for selected applications */}
          {data.status === 'SELECTED' && project && (
            <div className="border-t border-border pt-4 mt-2 text-center">
              <Link
                to={`/portal/project/${project.id}?token=${project.creatorAccessToken}`}
                className="inline-flex items-center justify-center font-body font-semibold transition-all duration-300 rounded-xl px-6 py-3 text-base bg-accent hover:bg-accent/90 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                View Project
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Application Details */}
        <div className="card mb-6">
          <h3 className="font-body font-semibold text-dark text-sm uppercase tracking-wide mb-4">Application Details</h3>
          <div className="space-y-3 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-muted">Applied as</span>
              <span className="text-dark font-medium">{data.creatorName} (@{data.creatorHandle})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Applied on</span>
              <span className="text-dark font-medium">{appliedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Campaign</span>
              <span className="text-dark font-medium">{CAMPAIGN_GOAL_LABELS[brief.campaignGoal] || brief.campaignGoal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Compensation</span>
              <span className="text-dark font-medium">{formatCompensation(brief)}</span>
            </div>
            {brief.deadline && (
              <div className="flex justify-between">
                <span className="text-muted">Deadline</span>
                <span className="text-dark font-medium">{formatDeadline(brief.deadline)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center space-y-3">
          <Link
            to="/portal/briefs"
            className="inline-flex items-center justify-center font-body font-semibold transition-all duration-300 rounded-xl px-6 py-3 text-base border-2 border-border bg-white hover:bg-bgWarm text-mid hover:shadow-sm"
          >
            Browse More Briefs
          </Link>
          <p className="text-xs text-muted font-body">
            Bookmark this page to check your status anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
