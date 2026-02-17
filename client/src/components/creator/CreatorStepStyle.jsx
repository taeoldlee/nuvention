import { CONTENT_STYLES, CREATOR_STRENGTHS, NEIGHBORHOODS, CUISINE_OPTIONS } from '../../utils/constants';
import Chip from '../common/Chip';

export default function CreatorStepStyle({ formActions }) {
  const {
    contentStyles, setContentStyles,
    strengths, setStrengths,
    cuisineSpecialties, setCuisineSpecialties,
    neighborhoods, setNeighborhoods,
    dreamBrands, brandInput, setBrandInput,
    toggleItem, addDreamBrand, removeDreamBrand,
  } = formActions;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">Your style and neighborhoods</h2>
        <p className="font-body text-muted text-sm">We use this to match you with brands that fit your vibe.</p>
      </div>

      <div>
        <label className="label">Content Styles *</label>
        <p className="text-xs text-muted mb-3">Select the styles that describe your work.</p>
        <div className="flex flex-wrap gap-2">
          {CONTENT_STYLES.map((style) => (
            <Chip key={style} label={style} selected={contentStyles.includes(style)} creator onClick={() => toggleItem(contentStyles, setContentStyles, style)} />
          ))}
        </div>
      </div>

      <div>
        <label className="label">Strengths *</label>
        <p className="text-xs text-muted mb-3">What do you do best?</p>
        <div className="flex flex-wrap gap-2">
          {CREATOR_STRENGTHS.map((s) => (
            <Chip key={s} label={s} selected={strengths.includes(s)} creator onClick={() => toggleItem(strengths, setStrengths, s)} />
          ))}
        </div>
      </div>

      <div>
        <label className="label">Neighborhoods *</label>
        <p className="text-xs text-muted mb-3">Where do you like to shoot?</p>
        <div className="flex flex-wrap gap-2">
          {NEIGHBORHOODS.map((n) => (
            <Chip key={n} label={n} selected={neighborhoods.includes(n)} creator onClick={() => toggleItem(neighborhoods, setNeighborhoods, n)} />
          ))}
        </div>
      </div>

      <div>
        <label className="label">Cuisines You Enjoy (optional)</label>
        <p className="text-xs text-muted mb-3">What types of food do you like to eat? We'll use this for matching, not to pigeonhole you.</p>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((c) => (
            <Chip key={c} label={c} selected={cuisineSpecialties.includes(c)} creator onClick={() => toggleItem(cuisineSpecialties, setCuisineSpecialties, c)} />
          ))}
        </div>
      </div>

      <div>
        <label className="label">Dream Brands (optional)</label>
        <p className="text-xs text-muted mb-3">Local spots you'd love to shoot for. Press Enter to add.</p>
        <input
          type="text"
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDreamBrand(); } }}
          placeholder="e.g. Philz Coffee"
          className="input input-creator mb-3"
        />
        {dreamBrands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dreamBrands.map((brand) => (
              <span key={brand} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-creator bg-creatorLight text-creator">
                {brand}
                <button type="button" aria-label={`Remove ${brand}`} onClick={() => removeDreamBrand(brand)} className="hover:text-creator/70 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
