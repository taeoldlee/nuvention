export default function ProjectDetailsCard({ briefText, deliverables, timeline, usageRights }) {
  return (
    <div className="card mb-6">
      <h2 className="font-display text-lg font-bold text-dark mb-4">
        Project Details
      </h2>

      {briefText && (
        <div className="mb-5">
          <h3 className="label">Brief</h3>
          <p className="font-body text-sm text-mid leading-relaxed">
            {briefText}
          </p>
        </div>
      )}

      {deliverables && (
        <div className="mb-5">
          <h3 className="label">Deliverables</h3>
          {Array.isArray(deliverables) ? (
            <ul className="space-y-2">
              {deliverables.map((d, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 font-body text-sm text-dark"
                >
                  <svg
                    className="w-4 h-4 text-creatorAccent shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {typeof d === 'string'
                    ? d
                    : d.description || d.name || JSON.stringify(d)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body text-sm text-dark">{deliverables}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {timeline && (
          <div className="bg-bgWarm rounded-xl p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Timeline
            </p>
            <p className="font-body text-sm font-medium text-dark">
              {timeline}
            </p>
          </div>
        )}
        <div className="bg-bgWarm rounded-xl p-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Usage Rights
          </p>
          <p className="font-body text-sm font-medium text-dark">
            {usageRights}
          </p>
        </div>
      </div>
    </div>
  );
}
