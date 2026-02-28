import {
  NEIGHBORHOODS,
  CUISINE_OPTIONS,
  BRAND_GOAL_CATEGORIES,
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

export default function OnboardingStepReview({ formActions, saving, saveError, onSubmit, onBack, analyzing }) {
  const {
    form,
    updateForm,
    toggleArrayItem,
    setSingleSelect,
    canSubmitReview,
  } = formActions;

  // Show loading screen while AI is still generating
  if (analyzing) {
    return (
      <div className="card">
        <LoadingSpinner message="Generating your profile..." />
      </div>
    );
  }

  const handleGoalSelect = (goal, category) => {
    updateForm('selectedGoal', {
      primary: goal.key,
      category: category.category,
      label: goal.label,
    });
    updateForm('customGoalText', '');
  };

  const handleCustomGoalChange = (text) => {
    updateForm('customGoalText', text);
    if (text.trim()) {
      updateForm('selectedGoal', null);
    }
  };

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-dark mb-1">
          Your brand
        </h2>
        <p className="font-body text-sm text-muted">
          Confirm the basics and tell us your #1 goal.
        </p>
      </div>

      {/* Section 1: Confirm the basics */}
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

      {/* Section 2: Pick your goal */}
      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">What's your #1 goal right now?</p>

        <div className="space-y-4">
          {BRAND_GOAL_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <p className="text-xs font-semibold text-mid font-body uppercase tracking-wide mb-2">
                {cat.label}
              </p>
              <div className="space-y-2">
                {cat.goals.map((goal) => {
                  const isSelected = form.selectedGoal?.primary === goal.key;
                  return (
                    <button
                      key={goal.key}
                      type="button"
                      onClick={() => handleGoalSelect(goal, cat)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-body transition-all ${
                        isSelected
                          ? 'border-accent bg-accentLight text-dark ring-2 ring-accent/30'
                          : 'border-border bg-white text-dark hover:border-accent/40 hover:bg-accent/5'
                      }`}
                    >
                      {goal.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-dark font-body mb-2">
            Something else? Tell us in your own words:
          </label>
          <input
            type="text"
            value={form.customGoalText}
            onChange={(e) => handleCustomGoalChange(e.target.value)}
            placeholder="e.g. I want to get more catering orders"
            className={`w-full px-4 py-3 rounded-xl border text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${
              form.customGoalText.trim() && !form.selectedGoal
                ? 'border-accent bg-accentLight ring-2 ring-accent/30'
                : 'border-border bg-white'
            }`}
          />
        </div>
      </div>

      {/* Submit */}
      {saveError && (
        <p className="text-sm text-red-600 font-body">{saveError}</p>
      )}

      <div className="pt-2 space-y-3">
        <Btn onClick={onSubmit} loading={saving} disabled={!canSubmitReview} className="w-full" size="lg">
          Create Profile
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
