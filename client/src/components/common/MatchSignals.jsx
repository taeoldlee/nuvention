export default function MatchSignals({ signals }) {
  if (!signals) return null;

  const sections = [
    { label: 'Venue alignment', items: signals.venueAlignment },
    { label: 'Aesthetic markers', items: signals.aestheticMarkers },
    { label: 'Community signals', items: signals.communitySignals },
    { label: 'Past outcomes', items: signals.pastOutcomes },
  ];

  const trust = signals.trustSignals || {};
  const trustItems = [
    trust.verifiedVenues != null ? `${trust.verifiedVenues} verified venues` : null,
    trust.verifiedSamples != null ? `${trust.verifiedSamples} verified samples` : null,
    trust.avgTurnaroundDays != null ? `${trust.avgTurnaroundDays} day avg turnaround` : null,
    trust.tier ? `${trust.tier} tier` : null,
  ].filter(Boolean);

  const hasContent = sections.some((s) => s.items && s.items.length) || trustItems.length > 0;
  if (!hasContent) return null;

  return (
    <div className="bg-bgWarm rounded-xl p-4 mb-4 border border-border">
      {sections.map((section) => {
        if (!section.items || section.items.length === 0) return null;
        return (
          <div key={section.label} className="mb-3">
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
              {section.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {section.items.map((item, idx) => (
                <span
                  key={`${section.label}-${idx}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-mid border border-border"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {trustItems.length > 0 && (
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
            Trust signals
          </p>
          <div className="flex flex-wrap gap-2">
            {trustItems.map((item, idx) => (
              <span
                key={`trust-${idx}`}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-bgTan text-mid border border-border"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
