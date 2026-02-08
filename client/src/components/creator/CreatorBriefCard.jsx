import { formatCents } from '../../utils/constants';

export default function CreatorBriefCard({ brief, onClick }) {
  const contentType =
    brief.contentRequest?.contentType ||
    brief.contentType ||
    brief.request?.contentType ||
    'Content Project';
  const neighborhood =
    brief.brand?.neighborhood ||
    brief.neighborhood ||
    brief.request?.neighborhood ||
    '';
  const pay =
    brief.price ?? brief.pay ?? brief.request?.budget ?? brief.budget ?? 0;
  const deliverables =
    brief.deliverables || brief.request?.deliverables || [];
  const timeline = brief.timeline || brief.request?.timeline || '';

  return (
    <button
      onClick={onClick}
      className="card text-left hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-creatorAccent/30 hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-1">
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-semibold text-dark truncate">
            {neighborhood ? `${neighborhood} \u00B7 ` : ''}
            {contentType}
          </p>
          {timeline && (
            <p className="font-body text-xs text-muted mt-0.5">{timeline}</p>
          )}
        </div>
        <span className="text-xs text-muted font-body shrink-0">Why this brief?</span>
      </div>

      {deliverables && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Array.isArray(deliverables) ? (
            <>
              {deliverables.slice(0, 3).map((d, i) => (
                <span
                  key={typeof d === 'string' ? d : i}
                  className="px-2 py-0.5 text-xs rounded-full bg-creatorLight text-creator font-medium"
                >
                  {d}
                </span>
              ))}
              {deliverables.length > 3 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-bgWarm text-muted font-medium">
                  +{deliverables.length - 3} more
                </span>
              )}
            </>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded-full bg-creatorLight text-creator font-medium">
              {deliverables}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
        <span className="font-display text-xl sm:text-2xl font-bold text-dark">
          {formatCents(pay)}
        </span>
        <span className="font-body text-sm text-creatorAccent font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
          View Brief
          <svg
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </span>
      </div>
    </button>
  );
}
