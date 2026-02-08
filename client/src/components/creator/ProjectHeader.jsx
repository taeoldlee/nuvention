import { formatCompensation } from '../../utils/constants';
import StatusBadge from '../common/StatusBadge';
import ProjectStatusTracker from '../common/ProjectStatusTracker';

export default function ProjectHeader({ brandName, brandPhoto, contentType, status, compensationType, compensationDetails, pay }) {
  return (
    <div className="card mb-6">
      <div className="flex items-start gap-4 mb-5">
        {brandPhoto ? (
          <img
            src={brandPhoto}
            alt={brandName}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-creatorLight flex items-center justify-center shrink-0">
            <span className="font-display text-xl font-bold text-creator">
              {brandName.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-dark mb-0.5 truncate">
            {brandName}
          </h1>
          <p className="font-body text-muted text-sm">{contentType}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="text-center py-5 bg-creatorLight/30 rounded-xl mb-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
          Compensation
        </p>
        <p className="font-display text-2xl sm:text-3xl font-bold text-dark">
          {formatCompensation(compensationType, compensationDetails, pay)}
        </p>
      </div>

      <ProjectStatusTracker status={status} creator />
    </div>
  );
}
