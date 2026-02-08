import Btn from '../common/Btn';
import MatchCard from './MatchCard';

export default function MatchResults({ matches, requestId, requestContext, onReset }) {
  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={onReset}
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
            <Btn onClick={onReset}>Try Again</Btn>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((match, idx) => (
            <MatchCard
              key={match.id || idx}
              match={match}
              idx={idx}
              requestId={requestId}
              requestContext={requestContext}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
