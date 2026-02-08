import Btn from '../common/Btn';

export default function OnboardingStepBudget({ form, updateForm, canProceed, onBack, onNext }) {
  return (
    <div className="card space-y-6">
      <h2 className="font-display text-xl font-semibold text-dark">
        Budget & preferences
      </h2>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2 font-body">
          Budget per piece of content
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1 font-body">Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-body text-sm">$</span>
              <input
                type="number"
                min={50}
                max={form.budgetMax}
                value={form.budgetMin}
                onChange={(e) => updateForm('budgetMin', Number(e.target.value))}
                className="w-full pl-7 pr-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>
          </div>
          <span className="text-muted mt-5">--</span>
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1 font-body">Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-body text-sm">$</span>
              <input
                type="number"
                min={form.budgetMin}
                max={2000}
                value={form.budgetMax}
                onChange={(e) => updateForm('budgetMax', Number(e.target.value))}
                className="w-full pl-7 pr-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted mt-2 font-body">
          Most content on Locale is priced between $150 and $400 per piece.
        </p>
      </div>

      {/* Budget Slider Visual */}
      <div>
        <input
          type="range"
          min={50}
          max={2000}
          value={form.budgetMax}
          onChange={(e) => updateForm('budgetMax', Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-muted font-body">
          <span>$50</span>
          <span>${form.budgetMin} &ndash; ${form.budgetMax}</span>
          <span>$2,000</span>
        </div>
      </div>

      {/* Content No-Gos */}
      <div>
        <label className="block text-sm font-medium text-dark mb-1.5 font-body">
          Any content no-go's?{' '}
          <span className="text-muted font-normal">(optional)</span>
        </label>
        <textarea
          value={form.contentNoGos}
          onChange={(e) => updateForm('contentNoGos', e.target.value)}
          rows={3}
          placeholder="e.g. No alcohol in photos, avoid showing the kitchen, etc."
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Btn variant="ghost" onClick={onBack}>
          Back
        </Btn>
        <Btn onClick={onNext} disabled={!canProceed}>
          Continue
        </Btn>
      </div>
    </div>
  );
}
