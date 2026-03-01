import Btn from '../common/Btn';

const GOALS = [
  { key: 'attract_new_faces', label: 'Get more customers', category: 'GET_MORE_CUSTOMERS' },
  { key: 'launch_menu_item', label: 'Promote something new', category: 'PROMOTE_SOMETHING' },
  { key: 'grow_social_media', label: 'Grow my social media', category: 'BUILD_MY_BRAND_ONLINE' },
  { key: 'get_quality_content', label: 'Get quality content', category: 'BUILD_MY_BRAND_ONLINE' },
];

export default function OnboardingStepGoal({ formActions, saving, saveError, onSubmit, onBack }) {
  const { form, updateForm } = formActions;
  const selected = form.selectedGoal?.primary || '';

  const handleChange = (e) => {
    const key = e.target.value;
    if (!key) {
      updateForm('selectedGoal', null);
      return;
    }
    const goal = GOALS.find((g) => g.key === key);
    if (goal) {
      updateForm('selectedGoal', {
        primary: goal.key,
        category: goal.category,
        label: goal.label,
      });
      updateForm('customGoalText', '');
    }
  };

  const canContinue = !!form.selectedGoal || !!form.customGoalText.trim();

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

      <div>
        <select
          value={selected}
          onChange={handleChange}
          className="w-full px-4 py-3.5 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none"
        >
          <option value="">Select a goal...</option>
          {GOALS.map((g) => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
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
            if (e.target.value.trim()) updateForm('selectedGoal', null);
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
