import { BRAND_GOAL_CATEGORIES } from '../../utils/constants';
import Btn from '../common/Btn';

export default function OnboardingStepGoal({ formActions, saving, saveError, onSubmit, onBack }) {
  // saving/saveError may not be passed when used as intermediate step
  const { form, updateForm, canSubmit } = formActions;

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
        <h2 className="font-display text-2xl font-bold text-dark mb-2">
          Your goal
        </h2>
        <p className="font-body text-sm text-muted">
          What's your #1 goal right now?
        </p>
      </div>

      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
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

      {saveError && (
        <p className="text-sm text-red-600 font-body">{saveError}</p>
      )}

      <div className="pt-2 space-y-3">
        <Btn onClick={onSubmit} loading={saving} disabled={!canSubmit} className="w-full" size="lg">
          {saving ? 'Creating Profile...' : 'Continue'}
        </Btn>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full text-sm text-muted hover:text-dark font-body underline underline-offset-2 transition-colors"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
