import Btn from '../common/Btn';

const VIBE_SCALES = [
  { key: 'cozyEnergetic', left: 'Cozy', right: 'Energetic' },
  { key: 'quietBuzzy', left: 'Quiet', right: 'Buzzy' },
  { key: 'classicModern', left: 'Classic', right: 'Modern' },
  { key: 'casualElevated', left: 'Casual', right: 'Elevated' },
];

export default function OnboardingStepConfirm({ form, saving, saveError, onBack, onSubmit }) {
  return (
    <div className="card space-y-6">
      <h2 className="font-display text-xl font-semibold text-dark">
        Looks good?
      </h2>
      <p className="text-sm text-muted font-body">
        Review your profile before we start matching.
      </p>

      <div className="bg-bgWarm rounded-xl p-5 space-y-4">
        {/* Business Name */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
            Business
          </p>
          <p className="text-dark font-semibold font-body">
            {form.businessName}
          </p>
        </div>

        {/* Neighborhood */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
            Neighborhood
          </p>
          <p className="text-dark font-body">{form.neighborhood}</p>
        </div>

        {/* Vibe */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
            Vibe
          </p>
          <div className="flex flex-wrap gap-1.5">
            {form.vibes.map((v) => (
              <span
                key={v}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Values */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
            Values
          </p>
          <div className="flex flex-wrap gap-1.5">
            {form.values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Content Comfort Zones */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
            Content zones
          </p>
          <div className="flex flex-wrap gap-1.5">
            {form.contentComfortZones.map((c) => (
              <span
                key={c}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Vibe Scales */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
            Vibe scales
          </p>
          <div className="space-y-2">
            {VIBE_SCALES.map((scale) => (
              <div key={scale.key} className="text-sm text-dark font-body">
                {scale.left} ↔ {scale.right}: {form.vibeScales[scale.key]}
              </div>
            ))}
          </div>
        </div>

        {/* Guest Experience Keywords */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
            Guest experience
          </p>
          <div className="flex flex-wrap gap-1.5">
            {form.guestExperienceKeywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-bgTan text-mid border border-border"
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* Visual References */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
            Visual references
          </p>
          {form.visualRefUrls.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {form.visualRefUrls.map((url, idx) => (
                <div key={url + idx} className="aspect-square rounded-lg overflow-hidden border border-border bg-bgTan">
                  <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted font-body">No references uploaded</p>
          )}
        </div>

        {/* Budget */}
        <div>
          <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
            Budget
          </p>
          <p className="text-dark font-body">
            ${form.budgetMin} &ndash; ${form.budgetMax} per piece
          </p>
        </div>

        {/* No-Gos */}
        {form.contentNoGos && (
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
              No-go's
            </p>
            <p className="text-dark font-body text-sm">
              {form.contentNoGos}
            </p>
          </div>
        )}
      </div>

      {saveError && (
        <p className="text-sm text-red-600 font-body">{saveError}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Btn variant="ghost" onClick={onBack}>
          Back
        </Btn>
        <Btn onClick={onSubmit} loading={saving}>
          Create Profile
        </Btn>
      </div>
    </div>
  );
}
