import { CONTENT_STYLES, CREATOR_STRENGTHS, NEIGHBORHOODS, CUISINE_OPTIONS } from '../../utils/constants';
import Chip from '../common/Chip';
import Btn from '../common/Btn';

function Section({ label, children }) {
  return (
    <div>
      <label className="label mb-2">{label}</label>
      {children}
    </div>
  );
}

export default function CreatorStepReview({
  formActions,
  importedPortfolio,
  onRemovePortfolioItem,
  saving,
  error,
  onSubmit,
}) {
  const {
    displayName, setDisplayName,
    bio, setBio,
    instagram, setInstagram,
    tiktok, setTiktok,
    contentStyles, setContentStyles,
    strengths, setStrengths,
    cuisineSpecialties, setCuisineSpecialties,
    neighborhoods, setNeighborhoods,
    dreamBrands, brandInput, setBrandInput,
    toggleItem, addDreamBrand, removeDreamBrand,
  } = formActions;

  const canSubmit = displayName.trim() && bio.trim() && contentStyles.length > 0 && strengths.length > 0 && neighborhoods.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">Review your profile</h2>
        <p className="font-body text-muted text-sm">
          We've pulled in info from your social media. Tweak anything that doesn't look right.
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-creatorLight/30 rounded-xl p-5 space-y-4">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Profile</p>

        <Section label="Display Name">
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Maya Chen" className="input input-creator" />
        </Section>

        <Section label="Bio">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few words about what you love to shoot..." rows={3} maxLength={280} className="input input-creator resize-none" />
          <p className="text-xs text-muted mt-1 text-right">{bio.length}/280</p>
        </Section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Instagram</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
              <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value.replace('@', ''))} placeholder="handle" className="input input-creator pl-8" />
            </div>
          </div>
          <div>
            <label className="label">TikTok</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
              <input type="text" value={tiktok} onChange={(e) => setTiktok(e.target.value.replace('@', ''))} placeholder="handle" className="input input-creator pl-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Style & Strengths */}
      <div className="bg-creatorLight/30 rounded-xl p-5 space-y-5">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Style & Strengths</p>

        <Section label="Content Styles *">
          <div className="flex flex-wrap gap-2">
            {CONTENT_STYLES.map((style) => (
              <Chip key={style} label={style} selected={contentStyles.includes(style)} creator onClick={() => toggleItem(contentStyles, setContentStyles, style)} />
            ))}
          </div>
        </Section>

        <Section label="Strengths *">
          <div className="flex flex-wrap gap-2">
            {CREATOR_STRENGTHS.map((s) => (
              <Chip key={s} label={s} selected={strengths.includes(s)} creator onClick={() => toggleItem(strengths, setStrengths, s)} />
            ))}
          </div>
        </Section>

        <Section label="Neighborhoods *">
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS.map((n) => (
              <Chip key={n} label={n} selected={neighborhoods.includes(n)} creator onClick={() => toggleItem(neighborhoods, setNeighborhoods, n)} />
            ))}
          </div>
        </Section>

        <Section label="Cuisines You Enjoy">
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <Chip key={c} label={c} selected={cuisineSpecialties.includes(c)} creator onClick={() => toggleItem(cuisineSpecialties, setCuisineSpecialties, c)} />
            ))}
          </div>
        </Section>
      </div>

      {/* Dream Brands */}
      <div className="bg-creatorLight/30 rounded-xl p-5 space-y-4">
        <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">Dream Brands</p>
        <Section label="Local spots you'd love to shoot for">
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
        </Section>
      </div>

      {/* Imported Portfolio */}
      {importedPortfolio && importedPortfolio.length > 0 && (
        <div className="bg-creatorLight/30 rounded-xl p-5 space-y-4">
          <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">
            Imported Portfolio ({importedPortfolio.length} items)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {importedPortfolio.map((item, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-bgTan group">
                <img src={item.url} alt={item.caption || `Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  aria-label={`Remove portfolio item ${idx + 1}`}
                  onClick={() => onRemovePortfolioItem(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-dark/70 text-white flex items-center justify-center text-xs hover:bg-dark transition-colors opacity-0 group-hover:opacity-100"
                >
                  &times;
                </button>
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[10px] text-white line-clamp-2">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-body">{error}</p>
        </div>
      )}

      <Btn creator onClick={onSubmit} loading={saving} disabled={!canSubmit} className="w-full" size="lg">
        Complete Setup
      </Btn>
    </div>
  );
}
