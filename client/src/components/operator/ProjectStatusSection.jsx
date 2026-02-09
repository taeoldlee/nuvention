import Btn from '../common/Btn';

function StatusCard({ iconBg, iconColor, iconPath, title, description, children }) {
  return (
    <div className="card">
      <div className="text-center py-8">
        <div className={`w-14 h-14 rounded-2xl ${iconBg} mx-auto mb-4 flex items-center justify-center`}>
          <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
        <h3 className="font-display text-lg font-semibold text-dark mb-2">{title}</h3>
        <p className="text-sm text-muted font-body max-w-md mx-auto">{description}</p>
        {children}
      </div>
    </div>
  );
}

export function BriefSentSection() {
  return (
    <StatusCard
      iconBg="bg-yellowBg"
      iconColor="text-yellowText"
      iconPath="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      title="Brief sent to creator"
      description="The creator has received your brief and will start working on your content shortly."
    />
  );
}

export function RevisionRequestedSection() {
  return (
    <StatusCard
      iconBg="bg-yellowBg"
      iconColor="text-yellowText"
      iconPath="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
      title="Revision requested"
      description="The creator has been notified and is working on your changes. You'll get an updated draft soon."
    />
  );
}

export function ApprovedSection({ onDeliver, actionLoading, latestDraft }) {
  const images = latestDraft?.fileUrls || latestDraft?.images;
  return (
    <div className="card">
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-2xl bg-greenBg mx-auto mb-4 flex items-center justify-center">
          <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-semibold text-dark mb-2">Content approved</h3>
        <p className="text-sm text-muted font-body max-w-md mx-auto mb-6">
          You approved this content. Mark it as delivered when you've posted it.
        </p>
        <Btn onClick={onDeliver} loading={actionLoading === 'deliver'}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Mark as Delivered
        </Btn>
      </div>

      {images?.length > 0 && (
        <ImageGrid images={images} label="Approved" />
      )}
    </div>
  );
}

export function DeliveredSection({ navigate, latestDraft }) {
  const images = latestDraft?.fileUrls || latestDraft?.images;
  return (
    <div className="card">
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-2xl bg-greenBg mx-auto mb-4 flex items-center justify-center">
          <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-semibold text-dark mb-2">Project complete</h3>
        <p className="text-sm text-muted font-body max-w-md mx-auto mb-6">
          This content has been delivered. You can find it in your content library.
        </p>
        <Btn variant="secondary" onClick={() => navigate('/operator/library')}>
          View Library
        </Btn>
      </div>

      {images?.length > 0 && (
        <ImageGrid images={images} label="Delivered" />
      )}
    </div>
  );
}

function ImageGrid({ images, label }) {
  return (
    <div className="mt-6 pt-6 border-t border-border">
      <p className="text-sm font-medium text-dark font-body mb-3">{label} content</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <div key={typeof img === 'string' ? img : img.url || i} className="aspect-square rounded-xl border border-border overflow-hidden bg-bgTan">
            <img
              src={typeof img === 'string' ? img : img.url}
              alt={`${label} ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = ''; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
