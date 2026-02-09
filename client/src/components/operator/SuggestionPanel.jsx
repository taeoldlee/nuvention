import { useState } from 'react';
import { getRequestSuggestions } from '../../api';
import { useToast } from '../../contexts/ToastContext';

export default function SuggestionPanel({ onApply }) {
  const { addToast } = useToast();
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    setLoading(true);
    try {
      const res = await getRequestSuggestions();
      setSuggestions(res.data.suggestions || []);
    } catch {
      addToast('Could not load AI suggestions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!suggestions) {
    return (
      <button
        onClick={handleLoad}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent/30 bg-accentLight text-accent text-sm font-semibold font-body hover:bg-accent/15 transition-all disabled:opacity-50"
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
        {loading ? 'Generating ideas...' : 'AI Suggest'}
      </button>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">AI-suggested ideas</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {suggestions.map((s) => (
          <button
            key={s.title}
            onClick={() => onApply(s)}
            className="card text-left hover:border-accent/30 hover:shadow-md transition-all p-4"
          >
            <p className="text-sm font-semibold text-dark font-body mb-1">{s.title}</p>
            <p className="text-xs text-muted font-body line-clamp-2">{s.subject}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-accentLight text-accent font-medium">
              {s.contentType}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
