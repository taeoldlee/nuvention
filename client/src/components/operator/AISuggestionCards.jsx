import { useState } from 'react';
import { getBriefSuggestions } from '../../api';
import { useToast } from '../../contexts/ToastContext';

const FIELD_LABELS = {
  creativeDirection: 'Creative Direction',
  dos: "Do's",
  donts: "Don'ts",
};

export default function AISuggestionCards({ campaignGoal, contentTypes, onApply }) {
  const { addToast } = useToast();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  if (!campaignGoal) return null;

  const handleFetch = async () => {
    setLoading(true);
    try {
      const res = await getBriefSuggestions({ campaignGoal, contentTypes });
      setSuggestion(res.data.suggestions || res.data);
      setVisible(true);
    } catch {
      addToast('Could not load AI suggestions. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (field, value) => {
    onApply(field, value);
    addToast(`"${FIELD_LABELS[field] || field}" filled from suggestion.`, 'success');
  };

  if (!visible) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent/30 bg-accentLight text-accent text-sm font-semibold font-body hover:bg-accent/15 transition-all disabled:opacity-50"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          )}
          {loading ? 'Generating suggestions...' : 'Get AI Suggestions'}
        </button>
      </div>
    );
  }

  if (!suggestion) return null;

  const comp = suggestion.compensationRange;
  const compNote = comp
    ? (comp.note || `$${Math.round((comp.min || 0) / 100)}–$${Math.round((comp.max || 0) / 100)}`)
    : null;

  return (
    <div className="mt-4 rounded-xl border border-accent/20 bg-bgWarm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-accentLight/50 border-b border-accent/15">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-xs font-semibold text-accent font-body uppercase tracking-wide">AI Suggested</span>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-muted hover:text-dark transition-colors"
          aria-label="Close suggestions"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {suggestion.creativeDirection && (
          <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-border">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-accent font-body uppercase tracking-wide font-semibold mb-1">Creative Direction</p>
              <p className="text-sm text-dark font-body leading-relaxed">{suggestion.creativeDirection}</p>
            </div>
            <button
              type="button"
              onClick={() => handleApply('creativeDirection', suggestion.creativeDirection)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-accentLight text-accent text-xs font-semibold font-body hover:bg-accent/20 transition-colors"
            >
              Use
            </button>
          </div>
        )}

        {suggestion.deliverableStructure && (
          <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-border">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-accent font-body uppercase tracking-wide font-semibold mb-1">Suggested Deliverables</p>
              <p className="text-sm text-dark font-body">{suggestion.deliverableStructure}</p>
            </div>
            <button
              type="button"
              onClick={() => handleApply('additionalNotes', `Deliverable structure: ${suggestion.deliverableStructure}`)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-accentLight text-accent text-xs font-semibold font-body hover:bg-accent/20 transition-colors"
            >
              Use
            </button>
          </div>
        )}

        {compNote && (
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-border">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-accent font-body uppercase tracking-wide font-semibold mb-1">Compensation Range</p>
              <p className="text-sm text-dark font-body">{compNote}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestion.dos && (
            <div className="flex items-start justify-between gap-3 p-3 bg-greenBg/30 rounded-lg border border-green/20">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-green font-body uppercase tracking-wide font-semibold mb-1">Do's</p>
                <p className="text-xs text-dark font-body leading-relaxed">{suggestion.dos}</p>
              </div>
              <button
                type="button"
                onClick={() => handleApply('dos', suggestion.dos)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-greenBg text-green text-xs font-semibold font-body hover:bg-green/15 transition-colors"
              >
                Use
              </button>
            </div>
          )}

          {suggestion.donts && (
            <div className="flex items-start justify-between gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200/50">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-red-600 font-body uppercase tracking-wide font-semibold mb-1">Don'ts</p>
                <p className="text-xs text-dark font-body leading-relaxed">{suggestion.donts}</p>
              </div>
              <button
                type="button"
                onClick={() => handleApply('donts', suggestion.donts)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold font-body hover:bg-red-100 transition-colors"
              >
                Use
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
