import { useState } from 'react';
import { formatDate } from '../../utils/constants';
import Btn from '../common/Btn';

export default function DraftReviewSection({ draft, error, onApprove, onRevision, actionLoading }) {
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const images = draft.fileUrls || draft.images;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-dark">
          Draft for Review
        </h2>
        <span className="text-xs text-muted font-body">
          {draft.submittedAt && `Submitted ${formatDate(draft.submittedAt)}`}
        </span>
      </div>

      {/* Draft Images */}
      {images?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border border-border overflow-hidden bg-bgTan"
            >
              <img
                src={typeof img === 'string' ? img : img.url}
                alt={`Draft ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Creator Notes */}
      {draft.notes && (
        <div className="bg-bgWarm rounded-xl p-4 mb-4">
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
            Creator Notes
          </p>
          <p className="text-sm text-dark font-body leading-relaxed">
            {draft.notes}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 font-body mb-4">{error}</p>
      )}

      {/* Revision Input */}
      {showRevisionInput && (
        <div className="bg-bgWarm rounded-xl p-4 mb-4">
          <label className="block text-sm font-medium text-dark mb-1.5 font-body">
            Revision notes
          </label>
          <textarea
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            rows={3}
            placeholder="Describe what you'd like changed..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none mb-3"
          />
          <div className="flex gap-2">
            <Btn
              size="sm"
              onClick={() => onRevision(draft.id, revisionNotes.trim())}
              loading={actionLoading === 'revision'}
              disabled={!revisionNotes.trim()}
            >
              Send Revision Request
            </Btn>
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => { setShowRevisionInput(false); setRevisionNotes(''); }}
            >
              Cancel
            </Btn>
          </div>
        </div>
      )}

      {/* Action CTAs */}
      {!showRevisionInput && (
        <div className="flex gap-3">
          <Btn
            onClick={() => onApprove(draft.id)}
            loading={actionLoading === 'approve'}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Approve
          </Btn>
          <Btn
            variant="secondary"
            onClick={() => setShowRevisionInput(true)}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Request Revision
          </Btn>
        </div>
      )}
    </div>
  );
}
