import { useNavigate } from 'react-router-dom';
import { CONTENT_TYPES, formatCents } from '../../utils/constants';
import useNewRequestForm from '../../hooks/useNewRequestForm';
import Btn from '../../components/common/Btn';
import Chip from '../../components/common/Chip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchResults from '../../components/operator/MatchResults';
import SuggestionPanel from '../../components/operator/SuggestionPanel';
import FadeIn from '../../components/marketing/FadeIn';

const CONTENT_GOALS = [
  'Menu item spotlight',
  'Atmosphere / ambiance',
  'Signature dish',
  'Neighborhood vibe',
  'Community moment',
];

const REEL_LENGTHS = [15, 20, 30, 60];

const COMP_TYPES = [
  { value: 'FLAT_FEE', label: 'Flat fee' },
  { value: 'FREE_PRODUCT', label: 'Free product/meal' },
  { value: 'DISCOUNT_CODE', label: 'Discount code' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export default function NewRequest() {
  const navigate = useNavigate();
  const form = useNewRequestForm();

  if (form.loading) {
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

  if (form.matches) {
    return (
      <MatchResults
        matches={form.matches}
        requestId={form.requestId}
        requestContext={{ contentType: form.contentTypes.join(', '), compensationType: form.compensationType, budgetMin: form.budgetMin, budgetMax: form.budgetMax, compNotes: form.compNotes }}
        onReset={form.resetMatches}
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

        {/* AI Suggestions */}
        <FadeIn delay={0.05}>
        <div className="mb-6">
          <SuggestionPanel onApply={form.applySuggestion} />
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
                  selected={form.contentTypes.includes(type)}
                  onClick={() => form.setContentTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type])}
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
                  selected={form.contentGoals.includes(goal)}
                  onClick={() => form.setContentGoals((prev) => prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal])}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => form.setSubject(e.target.value)}
              placeholder="e.g. winter latte, morning light, pastry case"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">
              Creative direction <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={form.creativeDirection}
              onChange={(e) => form.setCreativeDirection(e.target.value)}
              rows={3}
              placeholder="Lighting, mood, angles, or must‑include elements"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-3 font-body">Deliverables</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-20 text-sm text-mid font-body">Photos</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => form.setPhotos((p) => Math.max(0, p - 1))} className="w-8 h-8 rounded-lg border border-border bg-white text-dark flex items-center justify-center hover:bg-bgTan transition-colors font-medium">-</button>
                  <span className="w-8 text-center text-sm font-medium text-dark font-body">{form.photos}</span>
                  <button type="button" onClick={() => form.setPhotos((p) => Math.min(10, p + 1))} className="w-8 h-8 rounded-lg border border-border bg-white text-dark flex items-center justify-center hover:bg-bgTan transition-colors font-medium">+</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-20 text-sm text-mid font-body">Reels</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => form.setReels((r) => Math.max(0, r - 1))} className="w-8 h-8 rounded-lg border border-border bg-white text-dark flex items-center justify-center hover:bg-bgTan transition-colors font-medium">-</button>
                  <span className="w-8 text-center text-sm font-medium text-dark font-body">{form.reels}</span>
                  <button type="button" onClick={() => form.setReels((r) => Math.min(5, r + 1))} className="w-8 h-8 rounded-lg border border-border bg-white text-dark flex items-center justify-center hover:bg-bgTan transition-colors font-medium">+</button>
                </div>
                {form.reels > 0 && (
                  <div className="flex items-center gap-1.5 ml-2">
                    {REEL_LENGTHS.map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => form.setReelLength(len)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${form.reelLength === len ? 'border-accent bg-accentLight text-accent' : 'border-border bg-white text-mid hover:border-accent/50'}`}
                      >
                        {len}s
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="w-20 text-sm text-mid font-body">Stories</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => form.setStories((s) => Math.max(0, s - 1))} className="w-8 h-8 rounded-lg border border-border bg-white text-dark flex items-center justify-center hover:bg-bgTan transition-colors font-medium">-</button>
                  <span className="w-8 text-center text-sm font-medium text-dark font-body">{form.stories}</span>
                  <button type="button" onClick={() => form.setStories((s) => Math.min(10, s + 1))} className="w-8 h-8 rounded-lg border border-border bg-white text-dark flex items-center justify-center hover:bg-bgTan transition-colors font-medium">+</button>
                </div>
              </div>
            </div>
            {form.deliverableString && (
              <p className="mt-3 text-xs text-accent font-medium font-body">{form.deliverableString}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">Timeline</label>
            <div className="flex flex-wrap gap-2">
              {form.TIMELINE_OPTIONS.map((t) => (
                <Chip
                  key={t.value}
                  label={t.value}
                  selected={form.timeline === t.value}
                  onClick={() => form.setTimeline(t.value)}
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
                  selected={form.compensationType === t.value}
                  onClick={() => form.setCompensationType(t.value)}
                />
              ))}
            </div>
            {(form.compensationType === 'FLAT_FEE' || form.compensationType === 'HYBRID') && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1 font-body">Min</label>
                  <input
                    type="number"
                    min={50}
                    value={form.budgetMin}
                    onChange={(e) => form.setBudgetMin(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1 font-body">Max</label>
                  <input
                    type="number"
                    min={form.budgetMin}
                    value={form.budgetMax}
                    onChange={(e) => form.setBudgetMax(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm"
                  />
                </div>
              </div>
            )}
            {(form.compensationType === 'FREE_PRODUCT' || form.compensationType === 'DISCOUNT_CODE' || form.compensationType === 'HYBRID') && (
              <div className="mt-3">
                <label className="block text-xs text-muted mb-1 font-body">Details</label>
                <input
                  value={form.compNotes}
                  onChange={(e) => form.setCompNotes(e.target.value)}
                  placeholder="e.g. $30 meal, 20% code, or meal + $100"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">Brief template</label>
            <textarea
              value={form.briefText}
              onChange={(e) => {
                form.setBriefTouched(true);
                form.setBriefTextOverride(e.target.value);
              }}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
            />
            <p className="text-xs text-muted mt-2 font-body">
              Pre‑populated template. Edit to customize.
            </p>
          </div>

          {form.error && <p className="text-sm text-red-600 font-body">{form.error}</p>}

          <div className="pt-2">
            <Btn
              onClick={form.handleFindMatches}
              disabled={!form.canSubmit}
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
