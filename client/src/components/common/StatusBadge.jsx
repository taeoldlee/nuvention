const STATUS_STYLES = {
  BRIEF_SENT: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'Brief Sent', creatorLabel: 'Brief Accepted' },
  DRAFT_SUBMITTED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Draft Submitted', creatorLabel: 'Draft Submitted' },
  REVISION_REQUESTED: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Revision Requested', creatorLabel: 'Revision Received' },
  APPROVED: { bg: 'bg-greenBg', text: 'text-green', label: 'Approved', creatorLabel: 'Approved' },
  DELIVERED: { bg: 'bg-greenBg', text: 'text-green', label: 'Delivered', creatorLabel: 'Delivered' },
  MATCHING: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Matching' },
  PRESENTED: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'Options Ready' },
  SELECTED: { bg: 'bg-greenBg', text: 'text-green', label: 'Selected' },
  COMPLETED: { bg: 'bg-greenBg', text: 'text-green', label: 'Completed' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
  SUBMITTED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Submitted' },
  PENDING: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'Pending' },
};

export default function StatusBadge({ status, creator = false, className = '' }) {
  const style = STATUS_STYLES[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: status,
  };

  const displayLabel = creator && style.creatorLabel ? style.creatorLabel : style.label;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${style.bg} ${style.text} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
