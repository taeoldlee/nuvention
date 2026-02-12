const OPERATOR_STEPS = [
  { key: 'BRIEF_SENT', label: 'Brief Sent' },
  { key: 'DRAFT_SUBMITTED', label: 'Draft Submitted' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'DELIVERED', label: 'Delivered' },
];

const CREATOR_STEPS = [
  { key: 'BRIEF_SENT', label: 'Brief Accepted' },
  { key: 'DRAFT_SUBMITTED', label: 'Draft Submitted' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function ProjectStatusTracker({ status, creator = false, className = '' }) {
  const activeColor = creator ? 'bg-creatorAccent' : 'bg-accent';
  const activeRing = creator ? 'ring-creatorAccent/20' : 'ring-accent/20';

  const STEPS = creator ? CREATOR_STEPS : OPERATOR_STEPS;
  // REVISION_REQUESTED maps to the same step as DRAFT_SUBMITTED
  const statusKey = status === 'REVISION_REQUESTED' ? 'DRAFT_SUBMITTED' : status;
  const currentIdx = STEPS.findIndex((s) => s.key === statusKey);

  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  i < currentIdx
                    ? `${activeColor} text-white`
                    : i === currentIdx
                    ? `${activeColor} text-white ring-4 ${activeRing}`
                    : 'bg-border/60 text-muted'
                }`}
              >
                {i < currentIdx ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 font-medium text-center max-w-[60px] sm:max-w-[80px] ${
                  i <= currentIdx ? 'text-dark' : 'text-muted'
                }`}
              >
                {step.label}
                {status === 'REVISION_REQUESTED' && i === currentIdx && (
                  <span className="block text-orange-600 text-[10px]">Revision</span>
                )}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 sm:mx-3 mt-[-1.2rem] transition-all duration-300 ${
                  i < currentIdx ? activeColor : 'bg-border/60'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
