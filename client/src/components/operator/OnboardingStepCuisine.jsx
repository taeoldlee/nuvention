import Chip from '../common/Chip';
import Btn from '../common/Btn';

const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Japanese', 'Thai', 'French', 'American',
  'Mediterranean', 'Indian', 'Korean', 'Chinese', 'Vietnamese',
  'Ethiopian', 'Middle Eastern', 'Bakery & Pastry', 'Coffee & Beverage',
  'Farm-to-Table', 'Fusion',
];

export default function OnboardingStepCuisine({ formActions, onBack, onNext }) {
  const { form, toggleArrayItem } = formActions;

  return (
    <div className="card space-y-6">
      <h2 className="font-display text-xl font-semibold text-dark">
        What cuisine does your business serve?
      </h2>
      <p className="font-body text-sm text-muted">
        Select all that apply. This helps us match you with creators who specialize in your type of food.
      </p>

      <div className="flex flex-wrap gap-2">
        {CUISINE_OPTIONS.map((cuisine) => (
          <Chip
            key={cuisine}
            label={cuisine}
            selected={form.cuisineTypes.includes(cuisine)}
            onClick={() => toggleArrayItem('cuisineTypes', cuisine)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Btn variant="ghost" onClick={onBack}>
          Back
        </Btn>
        <Btn onClick={onNext} disabled={form.cuisineTypes.length === 0}>
          Continue
        </Btn>
      </div>
    </div>
  );
}
