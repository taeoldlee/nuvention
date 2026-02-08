import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContentRequest } from '../../api';
import { CONTENT_TYPES, formatCents } from '../../utils/constants';
import Btn from '../../components/common/Btn';
import Chip from '../../components/common/Chip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchSignals from '../../components/common/MatchSignals';

const CONTENT_GOALS = [
  'Menu item spotlight',
  'Atmosphere / ambiance',
  'Signature dish',
  'Neighborhood vibe',
  'Community moment',
];

const DELIVERABLE_OPTIONS = [
  '3 photos + 1 Reel (15s)',
  '4 photos + 1 Story set',
  '3 photos + 1 Reel (20s)',
  '2 Reels + 3 Stories',
];

const TIMELINE_OPTIONS = [
  { value: 'Standard (5-7 days)', label: 'Standard' },
  { value: 'Rush (2-3 days)', label: 'Rush' },
];

const COMP_TYPES = [
  { value: 'FLAT_FEE', label: 'Flat fee' },
  { value: 'FREE_PRODUCT', label: 'Free product/meal' },
  { value: 'DISCOUNT_CODE', label: 'Discount code' },
  { value: 'HYBRID', label: 'Hybrid' },
];

function buildUsageRights(timeline) {
  if (timeline?.toLowerCase().includes('rush')) {
    return 'Organic social + in-store, 6 months';
  }
  return 'Organic social + in-store, 12 months';
}

function formatCompensation(type, details) {
  if (type === 'FREE_PRODUCT') {
    return details?.note ? `Free product: ${details.note}` : 'Free product/meal';
  }
  if (type === 'DISCOUNT_CODE') {
    return details?.note ? `Discount: ${details.note}` : 'Discount code';
  }
  if (type === 'HYBRID') {
    const cash = details?.minCents ? `${formatCents(details.minCents)}+` : 'Cash +';
    const note = details?.note ? details.note : 'product/benefit';
    return `${cash} ${note}`;
  }
  if (details?.minCents && details?.maxCents) {
    return `${formatCents(details.minCents)} - ${formatCents(details.maxCents)}`;
  }
  return 'Flat fee';
}

function buildBriefTemplate({
  contentType,
  contentGoal,
  subject,
  creativeDirection,
  deliverables,
  timeline,
  usageRights,
  compensationType,
  compensationDetails,
}) {
  const lines = [
    `Goal: ${contentGoal || 'Describe the specific goal'}`,
    `Subject: ${subject || 'What should be highlighted?'}`,
    `Creative direction: ${creativeDirection || 'Add any creative notes (lighting, mood, angles)'}`,
    `Deliverables: ${deliverables || 'Select deliverables'}`,
    `Timeline: ${timeline || 'Select timeline'}`,
    `Usage rights: ${usageRights || 'Usage rights will be generated'}`,
    `Compensation: ${formatCompensation(compensationType, compensationDetails)}`,
    `Content type: ${contentType || 'Select content type'}`,
  ];
  return lines.join('\n');
}

export default function NewRequest() {
  const navigate = useNavigate();

  const [contentType, setContentType] = useState('');
  const [contentGoal, setContentGoal] = useState('');
  const [subject, setSubject] = useState('');
  const [creativeDirection, setCreativeDirection] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [timeline, setTimeline] = useState(TIMELINE_OPTIONS[0].value);
  const [usageRights, setUsageRights] = useState(buildUsageRights(TIMELINE_OPTIONS[0].value));
  const [compensationType, setCompensationType] = useState('FLAT_FEE');
  const [budgetMin, setBudgetMin] = useState(150);
  const [budgetMax, setBudgetMax] = useState(300);
  const [compNotes, setCompNotes] = useState('');

  const [briefText, setBriefText] = useState('');
  const [briefTouched, setBriefTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState(null);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    setUsageRights(buildUsageRights(timeline));
  }, [timeline]);

  useEffect(() => {
    const details = {
      minCents: budgetMin * 100,
      maxCents: budgetMax * 100,
      note: compNotes.trim() || undefined,
    };
    const template = buildBriefTemplate({
      contentType,
      contentGoal,
      subject,
      creativeDirection,
      deliverables,
      timeline,
      usageRights,
      compensationType,
      compensationDetails: details,
    });
    if (!briefTouched) setBriefText(template);
  }, [
    contentType,
    contentGoal,
    subject,
    creativeDirection,
    deliverables,
    timeline,
    usageRights,
    compensationType,
    budgetMin,
    budgetMax,
    compNotes,
    briefTouched,
  ]);

  const handleFindMatches = async () => {
    if (!contentType || !contentGoal || !deliverables || !timeline) return;
    setLoading(true);
    setError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const compensationDetails = {
        minCents: budgetMin * 100,
        maxCents: budgetMax * 100,
        note: compNotes.trim() || undefined,
      };
      const res = await createContentRequest({
        contentType,
        description: briefText,
        briefText,
        contentGoal,
        subject,
        creativeDirection,
        deliverables,
        timeline,
        usageRights,
        briefTemplate: {
          contentGoal,
          subject,
          creativeDirection,
          deliverables,
          timeline,
          usageRights,
        },
        compensationType,
        compensationDetails,
        budgetRange: `${formatCents(budgetMin * 100)} - ${formatCents(budgetMax * 100)}`,
      });
      const request = res.data.request;
      setRequestId(request.id);
      setMatches(request.matches || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not find matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    contentType &&
    contentGoal &&
    deliverables &&
    timeline &&
    (compensationType !== 'FLAT_FEE' || (budgetMin > 0 && budgetMax >= budgetMin));

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="card text-center py-20">
            <LoadingSpinner message="Finding your best matches..." />
            <p className="text-sm text-muted font-body mt-4">
              We’re matching on brand safety, neighborhood fit, and style evidence...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (matches) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <button
              onClick={() => {
                setMatches(null);
                setRequestId(null);
              }}
              className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              New request
            </button>
            <h1 className="font-display text-3xl font-bold text-dark mb-2">
              Anonymous shortlist
            </h1>
            <p className="font-body text-muted">
              Content first. Identity is hidden until you select a creator.
            </p>
          </div>

          {matches.length === 0 && (
            <div className="card text-center py-12">
              <h3 className="font-display text-lg font-semibold text-dark mb-2">
                No matches found
              </h3>
              <p className="text-sm text-muted font-body mb-6">
                Try adjusting your brief for better results.
              </p>
              <Btn onClick={() => { setMatches(null); setRequestId(null); }}>
                Try Again
              </Btn>
            </div>
          )}

          <div className="space-y-4">
            {matches.map((match, idx) => {
              const hero = match.portfolioSamples?.[0]?.imageUrl || null;
              const thumbs = (match.portfolioSamples || []).slice(1, 3);
              return (
                <div
                  key={match.id || idx}
                  className="card hover:shadow-md hover:border-accent/20 transition-all duration-200"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-24">
                      <div className="w-24 h-24 rounded-xl bg-bgTan border border-border overflow-hidden">
                        {hero ? (
                          <img src={hero} alt="UGC sample" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted text-xs">UGC sample</div>
                        )}
                      </div>
                      {thumbs.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {thumbs.map((t, i) => (
                            <div key={t.id || i} className="w-7 h-7 rounded-md overflow-hidden border border-border bg-bgTan">
                              <img src={t.imageUrl} alt="sample" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accentLight text-accent">
                          {match.creatorAlias || `Creator ${String.fromCharCode(65 + idx)}`}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bgTan text-mid">
                          {contentType}
                        </span>
                      </div>

                      {(match.contentPreview || match.description) && (
                        <p className="text-sm text-dark font-body mb-3 leading-relaxed">
                          {match.contentPreview || match.description}
                        </p>
                      )}

                      <MatchSignals signals={match.matchSignals} />

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {match.deliverables && (
                          <div>
                            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Deliverables</p>
                            <p className="text-sm text-dark font-body font-medium">{match.deliverables}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Compensation</p>
                          <p className="text-sm text-dark font-body font-medium">
                            {formatCompensation(match.compensationType || compensationType, match.compensationDetails || {
                              minCents: budgetMin * 100,
                              maxCents: budgetMax * 100,
                              note: compNotes,
                            })}
                          </p>
                        </div>
                        {match.timeline && (
                          <div>
                            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Timeline</p>
                            <p className="text-sm text-dark font-body font-medium">{match.timeline}</p>
                          </div>
                        )}
                        {match.usageRights && (
                          <div>
                            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Usage</p>
                            <p className="text-sm text-dark font-body font-medium">{match.usageRights}</p>
                          </div>
                        )}
                      </div>

                      <Btn
                        size="sm"
                        onClick={() => navigate(`/operator/match/${match.id}`, {
                          state: { requestId, match },
                        })}
                      >
                        View Details
                        <svg className="w-3.5 h-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/operator/dashboard')}
            className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Dashboard
          </button>
          <h1 className="font-display text-3xl font-bold text-dark mb-2">New content request</h1>
          <p className="font-body text-muted">
            Build a brief in minutes. We’ll match on evidence and neighborhood fit.
          </p>
        </div>

        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">
              Content type
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  selected={contentType === type}
                  onClick={() => setContentType((prev) => (prev === type ? '' : type))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">Content goal</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_GOALS.map((goal) => (
                <Chip
                  key={goal}
                  label={goal}
                  selected={contentGoal === goal}
                  onClick={() => setContentGoal((prev) => (prev === goal ? '' : goal))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. winter latte, morning light, pastry case"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">
              Creative direction <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={creativeDirection}
              onChange={(e) => setCreativeDirection(e.target.value)}
              rows={3}
              placeholder="Lighting, mood, angles, or must‑include elements"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">Deliverables</label>
            <div className="flex flex-wrap gap-2">
              {DELIVERABLE_OPTIONS.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  selected={deliverables === d}
                  onClick={() => setDeliverables((prev) => (prev === d ? '' : d))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">Timeline</label>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_OPTIONS.map((t) => (
                <Chip
                  key={t.value}
                  label={t.value}
                  selected={timeline === t.value}
                  onClick={() => setTimeline(t.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">Compensation</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMP_TYPES.map((t) => (
                <Chip
                  key={t.value}
                  label={t.label}
                  selected={compensationType === t.value}
                  onClick={() => setCompensationType(t.value)}
                />
              ))}
            </div>
            {(compensationType === 'FLAT_FEE' || compensationType === 'HYBRID') && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1 font-body">Min</label>
                  <input
                    type="number"
                    min={50}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1 font-body">Max</label>
                  <input
                    type="number"
                    min={budgetMin}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm"
                  />
                </div>
              </div>
            )}
            {(compensationType === 'FREE_PRODUCT' || compensationType === 'DISCOUNT_CODE' || compensationType === 'HYBRID') && (
              <div className="mt-3">
                <label className="block text-xs text-muted mb-1 font-body">Details</label>
                <input
                  value={compNotes}
                  onChange={(e) => setCompNotes(e.target.value)}
                  placeholder="e.g. $30 meal, 20% code, or meal + $100"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">Brief template</label>
            <textarea
              value={briefText}
              onChange={(e) => {
                setBriefTouched(true);
                setBriefText(e.target.value);
              }}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
            />
            <p className="text-xs text-muted mt-2 font-body">
              Pre‑populated template. Edit to customize.
            </p>
          </div>

          {error && <p className="text-sm text-red-600 font-body">{error}</p>}

          <div className="pt-2">
            <Btn
              onClick={handleFindMatches}
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              Find Matches
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
