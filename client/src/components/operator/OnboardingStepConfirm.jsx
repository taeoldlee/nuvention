import { VIBE_SCALES } from '../../utils/constants';
import Btn from '../common/Btn';

function ConfirmSection({ label, children }) {
  return (
    <div>
      <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipList({ items, className = 'bg-accentLight text-accent border-accent/20' }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${className}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

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
        <ConfirmSection label="Business">
          <p className="text-dark font-semibold font-body">{form.businessName}</p>
        </ConfirmSection>

        <ConfirmSection label="Neighborhood">
          <p className="text-dark font-body">{form.neighborhood === 'Other' ? form.customNeighborhood : form.neighborhood}</p>
        </ConfirmSection>

        <ConfirmSection label="Vibe">
          <ChipList items={form.vibes} />
        </ConfirmSection>

        <ConfirmSection label="Values">
          <ChipList items={form.values} />
        </ConfirmSection>

        {form.cuisineTypes?.length > 0 && (
          <ConfirmSection label="Cuisine">
            <ChipList items={form.cuisineTypes} />
          </ConfirmSection>
        )}

        <ConfirmSection label="Content zones">
          <ChipList items={form.contentComfortZones} />
        </ConfirmSection>

        <ConfirmSection label="Vibe scales">
          <div className="space-y-2">
            {VIBE_SCALES.map((scale) => (
              <div key={scale.key} className="text-sm text-dark font-body">
                {scale.left} ↔ {scale.right}: {form.vibeScales?.[scale.key]}
              </div>
            ))}
          </div>
        </ConfirmSection>

        <ConfirmSection label="Guest experience">
          <ChipList items={form.guestExperienceKeywords} className="bg-bgTan text-mid border-border" />
        </ConfirmSection>

        <ConfirmSection label="Visual references">
          {(form.visualRefUrls?.length > 0) ? (
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
        </ConfirmSection>

        <ConfirmSection label="Budget">
          <p className="text-dark font-body">
            ${form.budgetMin} &ndash; ${form.budgetMax} per piece
          </p>
        </ConfirmSection>

        {form.contentNoGos && (
          <ConfirmSection label="No-go's">
            <p className="text-dark font-body text-sm">{form.contentNoGos}</p>
          </ConfirmSection>
        )}
      </div>

      {saveError && (
        <p className="text-sm text-red-600 font-body">{saveError}</p>
      )}

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
