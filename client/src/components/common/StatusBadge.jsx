const STATUS_STYLES = {
  // Brief statuses
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' },
  OPEN: { bg: 'bg-greenBg', text: 'text-green', label: 'Open' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Closed' },
  // Project statuses
  BRIEF_SENT: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'Brief Sent' },
  DRAFT_SUBMITTED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Draft Submitted' },
  REVISION_REQUESTED: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Revision Requested' },
  APPROVED: { bg: 'bg-greenBg', text: 'text-green', label: 'Approved' },
  DELIVERED: { bg: 'bg-greenBg', text: 'text-green', label: 'Delivered' },
  MATCHING: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Matching' },
  PRESENTED: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'Options Ready' },
  SELECTED: { bg: 'bg-greenBg', text: 'text-green', label: 'Selected' },
  COMPLETED: { bg: 'bg-greenBg', text: 'text-green', label: 'Completed' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
  SUBMITTED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Submitted' },
  PENDING: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'Pending' },
  // Application / project lifecycle
  AWAITING_CREATOR_ACCEPTANCE: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'Awaiting Acceptance' },
  ACCEPTED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Accepted' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'In Progress' },
  DECLINED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Declined' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
  WITHDRAWN: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Withdrawn' },
  DISPUTED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Disputed' },
};

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${style.bg} ${style.text} ${className}`}
    >
      {style.label}
    </span>
  );
}
