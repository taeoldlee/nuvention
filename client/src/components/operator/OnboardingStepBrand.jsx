import {
  NEIGHBORHOODS,
  VIBE_OPTIONS,
  VALUE_OPTIONS,
  CONTENT_COMFORT_ZONES,
} from '../../utils/constants';
import Btn from '../common/Btn';
import Chip from '../common/Chip';

const VIBE_SCALES = [
  { key: 'cozyEnergetic', left: 'Cozy', right: 'Energetic' },
  { key: 'quietBuzzy', left: 'Quiet', right: 'Buzzy' },
  { key: 'classicModern', left: 'Classic', right: 'Modern' },
  { key: 'casualElevated', left: 'Casual', right: 'Elevated' },
];

export default function OnboardingStepBrand({
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
  onVisualRefsSelected,
  canProceed,
  onBack,
  onNext,
}) {
  return (
    <div className="card space-y-6">
      <h2 className="font-display text-xl font-semibold text-dark">
        Brand identity
      </h2>

      {/* Business Name */}
      <div>
        <label className="block text-sm font-medium text-dark mb-1.5 font-body">
          Business Name
        </label>
        <input
          type="text"
          value={form.businessName}
          onChange={(e) => updateForm('businessName', e.target.value)}
          placeholder="e.g. The Bourgeois Pig"
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
        />
      </div>

      {/* Neighborhood */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2 font-body">
          Neighborhood
        </label>
        <div className="flex flex-wrap gap-2">
          {NEIGHBORHOODS.map((n) => (
            <Chip
              key={n}
              label={n}
              selected={form.neighborhood === n}
              onClick={() => setSingleSelect('neighborhood', n)}
            />
          ))}
        </div>
      </div>

      {/* Vibe */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2 font-body">
          Vibe <span className="text-muted font-normal">(select all that fit)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS.map((v) => (
            <Chip
              key={v}
              label={v}
              selected={form.vibes.includes(v)}
              onClick={() => toggleArrayItem('vibes', v)}
            />
          ))}
        </div>
      </div>

      {/* Vibe Scales */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-dark font-body">
          Vibe scales <span className="text-muted font-normal">(sliders)</span>
        </label>
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

      {/* Values */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2 font-body">
          Values <span className="text-muted font-normal">(select all that fit)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {VALUE_OPTIONS.map((v) => (
            <Chip
              key={v}
              label={v}
              selected={form.values.includes(v)}
              onClick={() => toggleArrayItem('values', v)}
            />
          ))}
        </div>
      </div>

      {/* Guest Experience Keywords */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2 font-body">
          Guest experience keywords <span className="text-muted font-normal">(1–3 words)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword();
              }
            }}
            placeholder="e.g. warm, neighborhood, slow"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          <Btn size="sm" onClick={addKeyword} disabled={form.guestExperienceKeywords.length >= 3}>
            Add
          </Btn>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.guestExperienceKeywords.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-bgTan text-mid border border-border"
            >
              {k}
              <button
                type="button"
                onClick={() => removeKeyword(k)}
                className="hover:text-dark"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-muted mt-2 font-body">
          {form.guestExperienceKeywords.length}/3 selected
        </p>
      </div>

      {/* Content Comfort Zones */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2 font-body">
          Content comfort zones{' '}
          <span className="text-muted font-normal">(what you want shot)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_COMFORT_ZONES.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={form.contentComfortZones.includes(c)}
              onClick={() => toggleArrayItem('contentComfortZones', c)}
            />
          ))}
        </div>
      </div>

      {/* Visual References */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2 font-body">
          Visual references <span className="text-muted font-normal">(optional, up to 5)</span>
        </label>
        <div className="border border-dashed border-border rounded-xl p-4 bg-bgWarm text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onVisualRefsSelected(e.target.files)}
            className="hidden"
            id="visual-refs-input"
          />
          <label htmlFor="visual-refs-input" className="cursor-pointer text-sm text-accent font-body">
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
              <div key={url + idx} className="aspect-square rounded-lg overflow-hidden border border-border bg-bgTan">
                <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted mt-2 font-body">
          {form.visualRefUrls.length}/5 uploaded
        </p>
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
