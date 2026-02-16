import {
  NEIGHBORHOODS,
  VIBE_OPTIONS,
  VALUE_OPTIONS,
  CONTENT_COMFORT_ZONES,
  VIBE_SCALES,
  CUISINE_OPTIONS,
} from '../../utils/constants';
import Btn from '../common/Btn';
import Chip from '../common/Chip';

function Section({ label, aiSuggested, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-dark font-body">{label}</label>
        {aiSuggested && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-200">
            AI-suggested
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function OnboardingStepReview({ formActions, saving, saveError, onSubmit }) {
  const {
    form,
    updateForm,
    toggleArrayItem,
    setSingleSelect,
    updateVibeScale,
    keywordInput,
    setKeywordInput,
    addKeyword,
    removeKeyword,
    visualRefUploading,
    visualRefError,
    handleVisualRefsSelected: onVisualRefsSelected,
    canSubmitReview,
  } = formActions;

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-dark mb-1">
          Review your profile
        </h2>
        <p className="font-body text-sm text-muted">
          Everything's been pre-filled. Tweak anything that doesn't look right.
        </p>
      </div>

      {/* Business Info */}
      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Business Info</p>

        <Section label="Business Name" aiSuggested>
          <input
            type="text"
            value={form.businessName}
            onChange={(e) => updateForm('businessName', e.target.value)}
            placeholder="e.g. The Bourgeois Pig"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
        </Section>

        <Section label="Neighborhood" aiSuggested>
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
      </div>

      {/* Vibe & Style */}
      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Vibe & Style</p>

        <Section label="Vibe" aiSuggested>
          <div className="flex flex-wrap gap-2">
            {VIBE_OPTIONS.map((v) => (
              <Chip key={v} label={v} selected={form.vibes.includes(v)} onClick={() => toggleArrayItem('vibes', v)} />
            ))}
          </div>
        </Section>

        <Section label="Vibe Scales" aiSuggested>
          <div className="space-y-3">
            {VIBE_SCALES.map((scale) => (
              <div key={scale.key}>
                <div className="flex items-center justify-between text-xs text-muted font-body mb-1">
                  <span>{scale.left}</span>
                  <span>{scale.right}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.vibeScales[scale.key] ?? 50}
                  onChange={(e) => updateVibeScale(scale.key, Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
            ))}
          </div>
        </Section>

        <Section label="Values" aiSuggested>
          <div className="flex flex-wrap gap-2">
            {VALUE_OPTIONS.map((v) => (
              <Chip key={v} label={v} selected={form.values.includes(v)} onClick={() => toggleArrayItem('values', v)} />
            ))}
          </div>
        </Section>

        <Section label="Guest Experience Keywords" aiSuggested>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
              placeholder="e.g. warm, neighborhood, slow"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
            <Btn size="sm" onClick={addKeyword} disabled={form.guestExperienceKeywords.length >= 3}>
              Add
            </Btn>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.guestExperienceKeywords.map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-bgTan text-mid border border-border">
                {k}
                <button type="button" aria-label={`Remove ${k}`} onClick={() => removeKeyword(k)} className="hover:text-dark">&times;</button>
              </span>
            ))}
          </div>
        </Section>
      </div>

      {/* Content Preferences */}
      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Content Preferences</p>

        <Section label="Content Comfort Zones" aiSuggested>
          <div className="flex flex-wrap gap-2">
            {CONTENT_COMFORT_ZONES.map((c) => (
              <Chip key={c} label={c} selected={form.contentComfortZones.includes(c)} onClick={() => toggleArrayItem('contentComfortZones', c)} />
            ))}
          </div>
        </Section>

        <Section label="Content No-Go's">
          <textarea
            value={form.contentNoGos}
            onChange={(e) => updateForm('contentNoGos', e.target.value)}
            rows={2}
            placeholder="e.g. No alcohol in photos, avoid showing the kitchen, etc."
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
          />
        </Section>
      </div>

      {/* Cuisine */}
      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Cuisine</p>

        <Section label="Cuisine Types" aiSuggested>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <Chip key={c} label={c} selected={form.cuisineTypes.includes(c)} onClick={() => toggleArrayItem('cuisineTypes', c)} />
            ))}
          </div>
        </Section>
      </div>

      {/* Budget */}
      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Budget</p>

        <Section label="Budget per piece of content" aiSuggested>
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
        </Section>
      </div>

      {/* Visual References */}
      <div className="bg-bgWarm rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Visual References</p>

        <Section label="Upload reference images" aiSuggested={form.visualRefUrls.length > 0}>
          <div className="border border-dashed border-border rounded-xl p-4 bg-white text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onVisualRefsSelected(e.target.files)}
              className="hidden"
              id="review-visual-refs-input"
            />
            <label htmlFor="review-visual-refs-input" className="cursor-pointer text-sm text-accent font-body">
              {visualRefUploading ? 'Uploading...' : 'Click to upload images'}
            </label>
            <p className="text-xs text-muted mt-1 font-body">JPG/PNG, up to 5 images</p>
          </div>
          {visualRefError && (
            <p className="text-sm text-red-600 font-body mt-2">{visualRefError}</p>
          )}
          {form.visualRefUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {form.visualRefUrls.map((url, idx) => (
                <div key={url + idx} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-bgTan group">
                  <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove reference ${idx + 1}`}
                    onClick={() => updateForm('visualRefUrls', form.visualRefUrls.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-dark/70 text-white flex items-center justify-center text-xs hover:bg-dark transition-colors opacity-0 group-hover:opacity-100"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Submit */}
      {saveError && (
        <p className="text-sm text-red-600 font-body">{saveError}</p>
      )}

      <div className="pt-2">
        <Btn onClick={onSubmit} loading={saving} disabled={!canSubmitReview} className="w-full" size="lg">
          Create Profile
        </Btn>
      </div>
    </div>
  );
}
