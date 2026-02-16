import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCreatorProfile, updateCreatorProfile, getPortfolio, uploadPortfolio, deletePortfolioItem } from '../../api';
import {
  CONTENT_STYLES,
  CREATOR_STRENGTHS,
  NEIGHBORHOODS,
} from '../../utils/constants';
import Chip from '../../components/common/Chip';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Settings() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [contentStyles, setContentStyles] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [dreamBrands, setDreamBrands] = useState([]);
  const [brandInput, setBrandInput] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const loadPortfolio = async () => {
    try {
      const res = await getPortfolio();
      setPortfolio(res.data.portfolioItems || []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getCreatorProfile();
        const p = res.data.profile;
        setDisplayName(p.displayName || '');
        setBio(p.bio || '');
        setInstagram(p.instagramHandle || '');
        setTiktok(p.tiktokHandle || '');
        setContentStyles(p.contentStyles || []);
        setStrengths(p.strengths || []);
        setNeighborhoods(p.neighborhoods || []);
        setDreamBrands(p.dreamBrands || []);
        setIsAvailable(p.isAvailable !== false);
        setPortfolio(p.portfolioItems || []);
      } catch (err) {
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const clearSuccess = () => setSuccess('');

  const toggleItem = (arr, setArr, item) => {
    setArr((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
    clearSuccess();
  };

  const addDreamBrand = () => {
    const value = brandInput.trim();
    if (value && !dreamBrands.includes(value)) {
      setDreamBrands((prev) => [...prev, value]);
    }
    setBrandInput('');
    clearSuccess();
  };

  const removeDreamBrand = (brand) => {
    setDreamBrands((prev) => prev.filter((b) => b !== brand));
    clearSuccess();
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateCreatorProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        instagramHandle: instagram.trim() || null,
        tiktokHandle: tiktok.trim() || null,
        contentStyles,
        strengths,
        neighborhoods,
        dreamBrands: dreamBrands.length > 0 ? dreamBrands : [],
        isAvailable,
      });
      await refreshProfile();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." creator />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark mb-1">
            Profile Settings
          </h1>
          <p className="font-body text-muted text-sm">
            Update your creator profile and preferences.
          </p>
        </div>
        <Btn variant="ghost" creator onClick={() => navigate('/creator/dashboard')}>
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </Btn>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700 font-body">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-700 font-body">{success}</p>
        </div>
      )}

      {/* Availability Toggle */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-dark mb-1">Availability</h2>
            <p className="text-sm text-muted font-body">
              {isAvailable ? 'You will receive new briefs from brands.' : "You won't receive new briefs while unavailable."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setIsAvailable(!isAvailable); clearSuccess(); }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAvailable ? 'bg-creatorAccent' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAvailable ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      <div className="card space-y-6">
        {/* Profile Section */}
        <h2 className="font-display text-xl font-semibold text-dark">
          About You
        </h2>

        {/* Display Name */}
        <div>
          <label className="label">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); clearSuccess(); }}
            placeholder="e.g. Maya Chen"
            className="input input-creator"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="label">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => { setBio(e.target.value); clearSuccess(); }}
            placeholder="A few words about what you love to shoot..."
            rows={3}
            maxLength={280}
            className="input input-creator resize-none"
          />
          <p className="text-xs text-muted mt-1 text-right">{bio.length}/280</p>
        </div>

        {/* Social handles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Instagram</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => { setInstagram(e.target.value.replace('@', '')); clearSuccess(); }}
                placeholder="handle"
                className="input input-creator pl-8"
              />
            </div>
          </div>
          <div>
            <label className="label">TikTok</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => { setTiktok(e.target.value.replace('@', '')); clearSuccess(); }}
                placeholder="handle"
                className="input input-creator pl-8"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Style Section */}
        <h2 className="font-display text-xl font-semibold text-dark">
          Style & Neighborhoods
        </h2>

        {/* Content Styles */}
        <div>
          <label className="label">Content Styles</label>
          <p className="text-xs text-muted mb-3">Select the styles that describe your work.</p>
          <div className="flex flex-wrap gap-2">
            {CONTENT_STYLES.map((style) => (
              <Chip
                key={style}
                label={style}
                selected={contentStyles.includes(style)}
                creator
                onClick={() => toggleItem(contentStyles, setContentStyles, style)}
              />
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div>
          <label className="label">Strengths</label>
          <p className="text-xs text-muted mb-3">What do you do best?</p>
          <div className="flex flex-wrap gap-2">
            {CREATOR_STRENGTHS.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={strengths.includes(s)}
                creator
                onClick={() => toggleItem(strengths, setStrengths, s)}
              />
            ))}
          </div>
        </div>

        {/* Neighborhoods */}
        <div>
          <label className="label">Neighborhoods</label>
          <p className="text-xs text-muted mb-3">Where do you like to shoot?</p>
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS.map((n) => (
              <Chip
                key={n}
                label={n}
                selected={neighborhoods.includes(n)}
                creator
                onClick={() => toggleItem(neighborhoods, setNeighborhoods, n)}
              />
            ))}
          </div>
        </div>

        {/* Dream Brands */}
        <div>
          <label className="label">Dream Brands <span className="text-muted font-normal">(optional)</span></label>
          <p className="text-xs text-muted mb-3">Local spots you'd love to shoot for. Press Enter to add.</p>
          <input
            type="text"
            value={brandInput}
            onChange={(e) => setBrandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDreamBrand();
              }
            }}
            placeholder="e.g. Philz Coffee"
            className="input input-creator mb-3"
          />
          {dreamBrands.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dreamBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-creator bg-creatorLight text-creator"
                >
                  {brand}
                  <button
                    type="button"
                    onClick={() => removeDreamBrand(brand)}
                    className="hover:text-creator/70 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="pt-4 border-t border-border flex justify-end">
          <Btn creator onClick={handleSave} loading={saving}>
            Save Changes
          </Btn>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="card mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-dark">Portfolio</h2>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files?.length) return;
                setPortfolioLoading(true);
                try {
                  const formData = new FormData();
                  Array.from(files).forEach((f) => formData.append('images', f));
                  await uploadPortfolio(formData);
                  await loadPortfolio();
                  setSuccess('Portfolio updated.');
                } catch {
                  setError('Failed to upload photos.');
                } finally {
                  setPortfolioLoading(false);
                  e.target.value = '';
                }
              }}
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-creatorAccent text-white hover:bg-creatorAccent/90 transition-colors cursor-pointer">
              {portfolioLoading ? 'Uploading...' : 'Add Photos'}
            </span>
          </label>
        </div>

        {portfolio.length === 0 ? (
          <p className="text-sm text-muted font-body text-center py-4">No portfolio items yet. Add some photos to showcase your work.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {portfolio.map((item) => (
              <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                <img
                  src={item.imageUrl}
                  alt={item.caption || 'Portfolio'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await deletePortfolioItem(item.id);
                      setPortfolio((prev) => prev.filter((p) => p.id !== item.id));
                    } catch {
                      setError('Failed to delete portfolio item.');
                    }
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
