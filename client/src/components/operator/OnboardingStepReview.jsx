import {
  NEIGHBORHOODS,
  CUISINE_OPTIONS,
} from '../../utils/constants';
import Btn from '../common/Btn';
import Chip from '../common/Chip';
import LoadingSpinner from '../common/LoadingSpinner';

function Section({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark font-body mb-2">{label}</label>
      {children}
    </div>
  );
}

export default function OnboardingStepReview({ formActions, onNext, onBack, analyzing }) {
  const {
    form,
    updateForm,
    toggleArrayItem,
    setSingleSelect,
    canProceedToGoal,
  } = formActions;

  // Show loading screen while AI is still generating
  if (analyzing) {
    return (
      <div className="card">
        <LoadingSpinner message="Generating your profile..." />
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-2">
          Your brand
        </h2>
        <p className="font-body text-sm text-muted">
          Confirm the basics.
        </p>
      </div>

      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Confirm the basics</p>

        <Section label="Business Name">
          <input
            type="text"
            value={form.businessName}
            onChange={(e) => updateForm('businessName', e.target.value)}
            placeholder="e.g. The Bourgeois Pig"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
        </Section>

        <Section label="Neighborhood">
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS.map((n) => (
              <Chip key={n} label={n} selected={form.neighborhood === n} onClick={() => setSingleSelect('neighborhood', n)} />
            ))}
            <Chip label="Other" selected={form.neighborhood === 'Other'} onClick={() => setSingleSelect('neighborhood', 'Other')} />
          </div>
          {form.neighborhood === 'Other' && (
            <input
              type="text"
              value={form.customNeighborhood}
              onChange={(e) => updateForm('customNeighborhood', e.target.value)}
              placeholder="Enter your neighborhood or city"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          )}
        </Section>

        <Section label="Cuisine Types">
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <Chip key={c} label={c} selected={form.cuisineTypes.includes(c)} onClick={() => toggleArrayItem('cuisineTypes', c)} />
            ))}
          </div>
        </Section>
      </div>

      <div className="pt-2 space-y-3">
        <Btn onClick={onNext} disabled={!canProceedToGoal} className="w-full" size="lg">
          Continue
        </Btn>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full text-sm text-muted hover:text-dark font-body underline underline-offset-2 transition-colors"
          >
            Back to search
          </button>
        )}
      </div>
    </div>
  );
}
