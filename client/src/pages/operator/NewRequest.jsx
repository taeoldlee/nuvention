import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContentRequest } from '../../api';
import { CONTENT_TYPES, formatCents, formatCompensation } from '../../utils/constants';
import Btn from '../../components/common/Btn';
import Chip from '../../components/common/Chip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchResults from '../../components/operator/MatchResults';

const CONTENT_GOALS = [
  'Menu item spotlight',
  'Atmosphere / ambiance',
  'Signature dish',
  'Neighborhood vibe',
  'Community moment',
];

const REEL_LENGTHS = [15, 30, 60];

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
  const [photoCount, setPhotoCount] = useState(0);
  const [reelCount, setReelCount] = useState(0);
  const [reelLength, setReelLength] = useState(15);
  const [customReelLength, setCustomReelLength] = useState('');
  const [storyCount, setStoryCount] = useState(0);
  const [customDeliverables, setCustomDeliverables] = useState('');

  const effectiveReelLength = customReelLength ? Number(customReelLength) : reelLength;

  const builtDeliverables = [
    photoCount > 0 && `${photoCount} photo${photoCount !== 1 ? 's' : ''}`,
    reelCount > 0 && `${reelCount} Reel${reelCount !== 1 ? 's' : ''} (${effectiveReelLength}s)`,
    storyCount > 0 && `${storyCount} Stor${storyCount !== 1 ? 'ies' : 'y'}`,
  ].filter(Boolean).join(' + ');

  const deliverables = customDeliverables || builtDeliverables;
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
            Build a brief in minutes. We'll match on evidence and neighborhood fit.
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
            <label className="block text-sm font-medium text-dark mb-3 font-body">Deliverables</label>

            <div className="space-y-3 mb-3">
              {/* Photos */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-bgWarm rounded-xl px-3 py-2">
                  <button type="button" onClick={() => setPhotoCount((c) => Math.max(0, c - 1))} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-dark font-bold hover:bg-gray-50 transition-colors">−</button>
                  <span className="w-8 text-center font-display text-lg font-bold text-dark">{photoCount}</span>
                  <button type="button" onClick={() => setPhotoCount((c) => c + 1)} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-dark font-bold hover:bg-gray-50 transition-colors">+</button>
                </div>
                <span className="text-sm font-medium text-dark font-body">Photos</span>
              </div>

              {/* Reels */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-bgWarm rounded-xl px-3 py-2">
                  <button type="button" onClick={() => setReelCount((c) => Math.max(0, c - 1))} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-dark font-bold hover:bg-gray-50 transition-colors">−</button>
                  <span className="w-8 text-center font-display text-lg font-bold text-dark">{reelCount}</span>
                  <button type="button" onClick={() => setReelCount((c) => c + 1)} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-dark font-bold hover:bg-gray-50 transition-colors">+</button>
                </div>
                <span className="text-sm font-medium text-dark font-body">Reels</span>
                {reelCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    {REEL_LENGTHS.map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => { setReelLength(len); setCustomReelLength(''); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          !customReelLength && reelLength === len
                            ? 'border-accent bg-accentLight text-accent'
                            : 'border-border bg-white text-muted hover:border-accent/50'
                        }`}
                      >
                        {len}s
                      </button>
                    ))}
                    <input
                      type="number"
                      min={1}
                      value={customReelLength}
                      onChange={(e) => setCustomReelLength(e.target.value)}
                      placeholder="Custom"
                      className={`w-20 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors text-center ${
                        customReelLength
                          ? 'border-accent bg-accentLight text-accent'
                          : 'border-border bg-white text-muted placeholder:text-muted/60'
                      }`}
                    />
                    <span className="text-xs text-muted font-body">sec</span>
                  </div>
                )}
              </div>

              {/* Stories */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-bgWarm rounded-xl px-3 py-2">
                  <button type="button" onClick={() => setStoryCount((c) => Math.max(0, c - 1))} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-dark font-bold hover:bg-gray-50 transition-colors">−</button>
                  <span className="w-8 text-center font-display text-lg font-bold text-dark">{storyCount}</span>
                  <button type="button" onClick={() => setStoryCount((c) => c + 1)} className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-dark font-bold hover:bg-gray-50 transition-colors">+</button>
                </div>
                <div>
                  <span className="text-sm font-medium text-dark font-body">Stories</span>
                  <p className="text-xs text-muted font-body">A set of 3-5 vertical slides (photo or short clip) posted as an Instagram/TikTok Story sequence</p>
                </div>
              </div>
            </div>

            {/* Preview */}
            {builtDeliverables && !customDeliverables && (
              <div className="bg-accentLight/50 rounded-xl px-4 py-2.5 mb-3">
                <p className="text-sm font-medium text-accent font-body">{builtDeliverables}</p>
              </div>
            )}

            {/* Custom override — always visible */}
            <div className="border-t border-border pt-3 mt-3">
              <label className="block text-xs text-muted font-medium font-body mb-1.5">Or type your own</label>
              <input
                value={customDeliverables}
                onChange={(e) => setCustomDeliverables(e.target.value)}
                placeholder="e.g. 2 Reels + 5 photos + 1 carousel"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
              {customDeliverables && (
                <p className="text-xs text-muted font-body mt-1.5">Custom input will be used instead of the builder above.</p>
              )}
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
      </div>
    </div>
  );
}
