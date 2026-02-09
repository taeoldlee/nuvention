import Btn from '../common/Btn';

function DraftImageGrid({ images, label }) {
  if (!images?.length) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {images.map((img, i) => (
        <div key={typeof img === 'string' ? img : img.url || i} className="aspect-square rounded-xl overflow-hidden">
          <img
            src={typeof img === 'string' ? img : img.url}
            alt={`${label} ${i + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      ))}
    </div>
  );
}

export function DraftSubmittedView({ latestDraft }) {
  const images = latestDraft.fileUrls || latestDraft.images;
  return (
    <div className="card mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-dark">
            Draft Submitted
          </h2>
          <p className="font-body text-sm text-muted">
            Waiting for review from the brand.
          </p>
        </div>
      </div>

      {images?.length > 0 && (
        <div className="mb-4">
          <DraftImageGrid images={images} label="Submitted" />
        </div>
      )}

      {latestDraft.notes && (
        <div className="bg-bgWarm rounded-xl p-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Your Notes
          </p>
          <p className="font-body text-sm text-mid leading-relaxed">
            {latestDraft.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export function ApprovedView({ isDelivered, latestDraft, navigate }) {
  const images = latestDraft?.fileUrls || latestDraft?.images;
  return (
    <div className="card mb-6 text-center py-8">
      <div className="w-16 h-16 rounded-full bg-greenBg mx-auto mb-4 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      </div>
      <h2 className="font-display text-2xl font-bold text-dark mb-2">
        {isDelivered ? 'Content Delivered' : 'Content Approved'}
      </h2>
      <p className="font-body text-muted max-w-sm mx-auto mb-6">
        {isDelivered
          ? 'This project is complete. Great work!'
          : 'The brand loved your content. Payment will be processed shortly.'}
      </p>

      {images?.length > 0 && (
        <div className="max-w-lg mx-auto">
          <DraftImageGrid images={images} label={isDelivered ? 'Delivered' : 'Approved'} />
        </div>
      )}
    </div>
  );
}
