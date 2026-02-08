import { formatDate } from '../../utils/constants';

export default function DraftHistory({ drafts }) {
  if (!drafts || drafts.length <= 1) return null;

  return (
    <div className="card">
      <h2 className="font-display text-lg font-semibold text-dark mb-4">
        Draft History
      </h2>
      <div className="space-y-3">
        {drafts.slice(1).map((draft, i) => (
          <div key={draft.id || i} className="bg-bgWarm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-dark font-body">
                Draft {drafts.length - 1 - i}
              </span>
              {draft.submittedAt && (
                <span className="text-xs text-muted font-body">
                  {formatDate(draft.submittedAt)}
                </span>
              )}
            </div>
            {(draft.fileUrls || draft.images)?.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {(draft.fileUrls || draft.images).map((img, j) => (
                  <img
                    key={typeof img === 'string' ? img : img.url || j}
                    src={typeof img === 'string' ? img : img.url}
                    alt={`Draft ${drafts.length - 1 - i} - ${j + 1}`}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-border"
                  />
                ))}
              </div>
            )}
            {draft.feedback && (
              <p className="text-xs text-muted font-body mt-2">
                Feedback: {draft.feedback}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
