import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContentRequest } from '../../api';
import { CONTENT_TYPES, formatCents, formatCompensation } from '../../utils/constants';
import Btn from '../../components/common/Btn';
import Chip from '../../components/common/Chip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchResults from '../../components/operator/MatchResults';
import FadeIn from '../../components/marketing/FadeIn';

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

  const [briefTouched, setBriefTouched] = useState(false);
  const [briefTextOverride, setBriefTextOverride] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState(null);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    setUsageRights(buildUsageRights(timeline));
  }, [timeline]);

  const compensationDetails = useMemo(() => ({
    minCents: budgetMin * 100,
    maxCents: budgetMax * 100,
    note: compNotes.trim() || undefined,
  }), [budgetMin, budgetMax, compNotes]);

  const generatedBriefText = useMemo(() => {
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
  }, [contentType, contentGoal, subject, creativeDirection, deliverables, timeline, usageRights, compensationType, compensationDetails]);

  const briefText = briefTouched ? briefTextOverride : generatedBriefText;

  const handleFindMatches = async () => {
    if (!contentType || !contentGoal || !deliverables || !timeline) return;
    setLoading(true);
    setError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
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
              We're matching on brand safety, neighborhood fit, and style evidence...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (matches) {
    return (
      <MatchResults
        matches={matches}
        requestId={requestId}
        requestContext={{ contentType, compensationType, budgetMin, budgetMax, compNotes }}
        onReset={() => { setMatches(null); setRequestId(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <FadeIn>
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
          <p className="section-label mb-2">New request</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark mb-2">New content request</h1>
          <p className="font-body text-muted">
            Build a brief in minutes. We'll match on evidence and neighborhood fit.
          </p>
        </div>
        </FadeIn>

        <FadeIn delay={0.1}>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                setBriefTextOverride(e.target.value);
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
        </FadeIn>
      </div>
    </div>
  );
}
