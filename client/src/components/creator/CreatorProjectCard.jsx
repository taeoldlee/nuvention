import { formatCents } from '../../utils/constants';
import { brandDisplayName } from '../../utils/extractors';
import StatusBadge from '../common/StatusBadge';

export default function CreatorProjectCard({ project, onClick }) {
  const brandName = brandDisplayName(project);
  const contentType =
    project.match?.contentRequest?.contentType ||
    project.contentType ||
    project.request?.contentType ||
    'Content Project';
  const status = project.status || 'BRIEF_SENT';
  const pay = project.price ?? project.pay ?? project.budget ?? 0;

  return (
    <button
      onClick={onClick}
      className="card w-full text-left hover:shadow-md hover:border-creatorAccent/30 transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-creatorLight flex items-center justify-center shrink-0">
          <span className="font-display text-lg font-bold text-creator">
            {brandName.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-dark truncate">
            {brandName}
          </p>
          <p className="font-body text-sm text-muted truncate">
            {contentType}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <StatusBadge status={status} />
          <span className="font-display text-lg font-bold text-dark">
            {formatCents(pay)}
          </span>
          <svg
            className="w-5 h-5 text-muted group-hover:text-creatorAccent group-hover:translate-x-0.5 transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}
