import { useState } from 'react';
import { BRAND_GOAL_CATEGORIES } from '../../utils/constants';
import Btn from '../common/Btn';

const CATEGORY_META = {
  GET_MORE_CUSTOMERS: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  PROMOTE_SOMETHING: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
      </svg>
    ),
  },
  BUILD_MY_BRAND_ONLINE: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
};

export default function OnboardingStepGoal({ formActions, saving, saveError, onSubmit, onBack }) {
  const { form, updateForm } = formActions;
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleCategoryClick = (categoryKey) => {
    setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
  };

  const handleGoalSelect = (goal, category) => {
    updateForm('selectedGoal', {
      primary: goal.key,
      category: category.category,
      label: goal.label,
    });
    updateForm('customGoalText', '');
  };

  const canContinue = !!(form.selectedGoal || form.customGoalText.trim());

  // Find which category contains the selected goal
  const selectedCategory = form.selectedGoal
    ? BRAND_GOAL_CATEGORIES.find((cat) =>
        cat.goals.some((g) => g.key === form.selectedGoal.primary)
      )?.category
    : null;

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-2">
          Your goal
        </h2>
        <p className="font-body text-sm text-muted">
          What's your #1 goal right now? Pick a category, then get specific.
        </p>
      </div>

      <div className="space-y-3">
        {BRAND_GOAL_CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat.category] || {};
          const isExpanded = expandedCategory === cat.category || selectedCategory === cat.category;
          const hasSelectedGoal = selectedCategory === cat.category;

          return (
            <div key={cat.category}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => handleCategoryClick(cat.category)}
                className={`w-full text-left px-4 py-4 rounded-xl border transition-all flex items-center gap-3 ${
                  hasSelectedGoal
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                    : isExpanded
                      ? 'border-accent/40 bg-white shadow-sm'
                      : 'border-border bg-white hover:border-accent/30 hover:shadow-sm'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  hasSelectedGoal ? 'bg-accent text-white' : 'bg-bgWarm text-mid'
                }`}>
                  {meta.icon}
                </div>
                <span className="font-body font-semibold text-dark text-sm flex-1">
                  {cat.label}
                </span>
                <svg
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Sub-goals */}
              {isExpanded && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-accent/20 space-y-1.5">
                  {cat.goals.map((goal) => {
                    const isSelected = form.selectedGoal?.primary === goal.key;
                    return (
                      <button
                        key={goal.key}
                        type="button"
                        onClick={() => handleGoalSelect(goal, cat)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-body transition-all ${
                          isSelected
                            ? 'bg-accent text-white font-medium'
                            : 'text-dark hover:bg-accent/5'
                        }`}
                      >
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-medium text-dark font-body mb-2">
          Something else? Tell us in your own words:
        </label>
        <input
          type="text"
          value={form.customGoalText}
          onChange={(e) => {
            updateForm('customGoalText', e.target.value);
            if (e.target.value.trim()) {
              updateForm('selectedGoal', null);
              setExpandedCategory(null);
            }
          }}
          placeholder="e.g. I want to get more catering orders"
          className={`w-full px-4 py-3 rounded-xl border text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${
            form.customGoalText.trim() && !form.selectedGoal
              ? 'border-accent bg-accentLight ring-2 ring-accent/30'
              : 'border-border bg-white'
          }`}
        />
      </div>

      {saveError && (
        <p className="text-sm text-red-600 font-body">{saveError}</p>
      )}

      <div className="pt-2 space-y-3">
        <Btn onClick={onSubmit} loading={saving} disabled={!canContinue} className="w-full" size="lg">
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
