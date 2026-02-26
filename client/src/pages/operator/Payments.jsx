import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getTransactions } from '../../api';
import FadeIn from '../../components/marketing/FadeIn';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import { formatCents, formatDate } from '../../utils/constants';

const ESCROW_STYLES = {
  HELD: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'In Escrow' },
  RELEASED: { bg: 'bg-greenBg', text: 'text-green', label: 'Released' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
  DISPUTED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Disputed' },
};

const STATUS_STYLES = {
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending' },
  ESCROW_HELD: { bg: 'bg-yellowBg', text: 'text-yellowText', label: 'Escrow Held' },
  RELEASED: { bg: 'bg-greenBg', text: 'text-green', label: 'Released' },
  REFUNDED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Refunded' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
};

function Badge({ styles, status }) {
  const style = styles[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function TransactionRow({ transaction, isExpanded, onToggle, onViewProject }) {
  const app = transaction.project?.application;
  const brief = app?.brief;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <>
      <tr
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        className="border-b border-border/50 hover:bg-bgWarm/50 transition-colors cursor-pointer"
      >
        <td className="py-3 px-3">
          <span className="text-sm text-muted font-body">{formatDate(transaction.createdAt)}</span>
        </td>
        <td className="py-3 px-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark font-body truncate">
              {brief?.title || 'Unknown Brief'}
            </p>
            {app?.creatorName && (
              <p className="text-xs text-muted font-body">{app.creatorName}</p>
            )}
          </div>
        </td>
        <td className="py-3 px-3 text-right">
          <span className="text-sm font-semibold text-dark font-body">{formatCents(transaction.amount)}</span>
        </td>
        <td className="py-3 px-3 hidden sm:table-cell">
          <Badge styles={ESCROW_STYLES} status={transaction.escrowStatus} />
        </td>
        <td className="py-3 px-3 hidden md:table-cell">
          <Badge styles={STATUS_STYLES} status={transaction.status} />
        </td>
        <td className="py-3 px-3 text-right">
          <svg
            className={`w-4 h-4 text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-bgWarm/30">
          <td colSpan={6} className="px-3 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-body">
              <div>
                <p className="text-xs text-muted mb-1">Total Amount</p>
                <p className="font-semibold text-dark">{formatCents(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Creator Payout</p>
                <p className="font-semibold text-dark">{formatCents(transaction.creatorPayout)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Platform Fee</p>
                <p className="font-semibold text-muted">{formatCents(transaction.platformFee)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Project Status</p>
                <p className="font-semibold text-dark">{transaction.project?.status?.replace(/_/g, ' ') || '—'}</p>
              </div>
            </div>
            {transaction.project?.id && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProject(transaction.project.id);
                  }}
                  className="text-xs text-accent hover:text-accentDark font-semibold font-body transition-colors"
                >
                  View Project →
                </button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function Payments() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getTransactions();
        setData(res.data);
      } catch (err) {
        console.error('[Payments] load error:', err);
        setError('Could not load payment history.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-border/50 rounded w-48" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card h-20 bg-border/20" />
              ))}
            </div>
            <div className="card h-64 bg-border/20" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold font-body"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { transactions = [], summary = {} } = data || {};

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <p className="section-label mb-2">Finances</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark mb-1">
                Payments
              </h1>
              <p className="font-body text-muted text-sm">
                Track escrow, payouts, and transaction history.
              </p>
            </div>
            <button
              onClick={() => navigate('/operator/dashboard')}
              className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body transition-colors self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Dashboard
            </button>
          </div>
        </FadeIn>

        {/* Summary Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Spent"
              value={formatCents(summary.totalSpent || 0)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                </svg>
              }
            />
            <StatCard
              label="In Escrow"
              value={formatCents(summary.inEscrow || 0)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              }
            />
            <StatCard
              label="Released"
              value={summary.releasedCount || 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Transactions"
              value={summary.totalTransactions || 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              }
            />
          </div>
        </FadeIn>

        {/* Transaction List */}
        <FadeIn delay={0.2}>
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-dark mb-4">Transaction History</h2>

            {transactions.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                }
                title="No transactions yet"
                description="When creators accept projects and payments are processed, they'll appear here."
              />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-3">Date</th>
                      <th className="text-left text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-3">Project</th>
                      <th className="text-right text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-3">Amount</th>
                      <th className="text-left text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-3 hidden sm:table-cell">Escrow</th>
                      <th className="text-left text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-3 hidden md:table-cell">Status</th>
                      <th className="pb-2 px-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <TransactionRow
                        key={t.id}
                        transaction={t}
                        isExpanded={expandedId === t.id}
                        onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
                        onViewProject={(id) => navigate(`/operator/project/${id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
