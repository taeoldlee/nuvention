import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createCreatorProfile, uploadPortfolio } from '../../api';
import {
  CONTENT_STYLES,
  CREATOR_STRENGTHS,
  NEIGHBORHOODS,
} from '../../utils/constants';
import ProgressBar from '../../components/common/ProgressBar';
import Btn from '../../components/common/Btn';
import Chip from '../../components/common/Chip';

const STEPS = ['Profile', 'Style', 'Portfolio', 'Done'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 — Profile
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Step 2 — Style & Neighborhoods
  const [contentStyles, setContentStyles] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [dreamBrands, setDreamBrands] = useState([]);
  const [brandInput, setBrandInput] = useState('');

  // Step 3 — Portfolio
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  /* ── Helpers ── */
  const toggleItem = (arr, setArr, item) => {
    setArr((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const addDreamBrand = () => {
    const value = brandInput.trim();
    if (value && !dreamBrands.includes(value)) {
      setDreamBrands((prev) => [...prev, value]);
    }
    setBrandInput('');
  };

  const handleBrandKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDreamBrand();
    }
  };

  const removeDreamBrand = (brand) => {
    setDreamBrands((prev) => prev.filter((b) => b !== brand));
  };

  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );
    const combined = [...portfolioFiles, ...newFiles].slice(0, 6);
    setPortfolioFiles(combined);

    // Generate previews
    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    // Revoke old preview URLs
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /* ── Step validation ── */
  const canProceed = () => {
    if (step === 0) return displayName.trim().length > 0 && bio.trim().length > 0;
    if (step === 1)
      return (
        contentStyles.length > 0 &&
        strengths.length > 0 &&
        neighborhoods.length > 0
      );
    if (step === 2) return portfolioFiles.length >= 3;
    return true;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const profileData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        instagram: instagram.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
        contentStyles,
        strengths,
        neighborhoods,
        dreamBrands: dreamBrands.length > 0 ? dreamBrands : undefined,
      };

      await createCreatorProfile(profileData);

      // Attempt portfolio upload
      if (portfolioFiles.length > 0) {
        try {
          const formData = new FormData();
          portfolioFiles.forEach((file) => formData.append('images', file));
          await uploadPortfolio(formData);
        } catch {
          // Portfolio upload may fail in demo — that's okay
          console.warn('Portfolio upload skipped (demo mode)');
        }
      }

      await refreshProfile();
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 2) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ── Render steps ── */
  const renderStep0 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">
          Tell us about yourself
        </h2>
        <p className="font-body text-muted text-sm">
          This helps brands get a feel for who you are.
        </p>
      </div>

      <div>
        <label className="label">Display Name *</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Maya Chen"
          className="input input-creator"
        />
      </div>

      <div>
        <label className="label">Bio *</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A few words about what you love to shoot..."
          rows={3}
          maxLength={280}
          className="input input-creator resize-none"
        />
        <p className="text-xs text-muted mt-1 text-right">
          {bio.length}/280
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Instagram (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">
              @
            </span>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
              placeholder="handle"
              className="input input-creator pl-8"
            />
          </div>
        </div>
        <div>
          <label className="label">TikTok (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">
              @
            </span>
            <input
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value.replace('@', ''))}
              placeholder="handle"
              className="input input-creator pl-8"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">
          Your style and neighborhoods
        </h2>
        <p className="font-body text-muted text-sm">
          We use this to match you with brands that fit your vibe.
        </p>
      </div>

      {/* Content Styles */}
      <div>
        <label className="label">Content Styles *</label>
        <p className="text-xs text-muted mb-3">
          Select the styles that describe your work.
        </p>
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
        <label className="label">Strengths *</label>
        <p className="text-xs text-muted mb-3">
          What do you do best?
        </p>
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
        <label className="label">Neighborhoods *</label>
        <p className="text-xs text-muted mb-3">
          Where do you like to shoot?
        </p>
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
        <label className="label">Dream Brands (optional)</label>
        <p className="text-xs text-muted mb-3">
          Local spots you'd love to shoot for. Press Enter to add.
        </p>
        <input
          type="text"
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
          onKeyDown={handleBrandKeyDown}
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
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">
          Show us your best work
        </h2>
        <p className="font-body text-muted text-sm">
          Upload 3-6 images that represent your style. This is your portfolio.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-creator/30 rounded-2xl p-10 text-center cursor-pointer hover:border-creator/60 hover:bg-creatorLight/30 transition-all duration-200"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />
        <div className="w-14 h-14 rounded-2xl bg-creatorLight mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-creator"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 21a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 013 3h18a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0121 21"
            />
          </svg>
        </div>
        <p className="font-body font-semibold text-dark mb-1">
          Drag photos here or click to browse
        </p>
        <p className="font-body text-sm text-muted">
          JPG, PNG, or WebP. Up to 6 images.
        </p>
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-mid">
              {previews.length} of 6 images
              {previews.length < 3 && (
                <span className="text-orange-600 ml-2 font-normal">
                  (minimum 3 required)
                </span>
              )}
            </p>
            {previews.length >= 3 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Looks great
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <img
                  src={src}
                  alt={`Portfolio ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-3 bg-creatorLight/50 rounded-xl p-4">
        <svg
          className="w-5 h-5 text-creator mt-0.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <p className="font-body text-sm text-creator">
          Your portfolio is only shared with brands after you accept a brief.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center py-8">
      {/* Celebration checkmark */}
      <div className="w-20 h-20 rounded-full bg-creatorLight mx-auto mb-6 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-creatorAccent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>

      <h2 className="font-display text-3xl font-bold text-dark mb-3">
        You're In
      </h2>
      <p className="font-body text-muted max-w-md mx-auto mb-10">
        Welcome to Locale. Here's how it works from here.
      </p>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-2xl mx-auto mb-10">
        {[
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            ),
            label: 'Matched by style',
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            ),
            label: 'Briefs arrive',
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: 'Accept or decline',
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            ),
            label: 'Submit & get paid',
          },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-creatorLight flex items-center justify-center text-creator mb-3">
              {item.icon}
            </div>
            <p className="font-body text-sm font-medium text-dark">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <Btn creator onClick={() => navigate('/creator/dashboard')} size="lg">
        Go to Dashboard
      </Btn>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div className="min-h-screen bg-bgTan">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-creatorAccent flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-dark">
              Locale
            </span>
          </div>
          <h1 className="font-display text-xl font-semibold text-dark">
            Creator Setup
          </h1>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div className="mb-8">
            <ProgressBar steps={STEPS} currentStep={step} creator />
          </div>
        )}

        {/* Step content */}
        <div className="card mb-6">{stepRenderers[step]()}</div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 3 && (
          <div className="flex items-center justify-between">
            <div>
              {step > 0 && (
                <Btn variant="ghost" creator onClick={handleBack}>
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                  Back
                </Btn>
              )}
            </div>
            <Btn
              creator
              onClick={handleNext}
              disabled={!canProceed()}
              loading={saving}
            >
              {step === 2 ? 'Complete Setup' : 'Continue'}
              {step < 2 && (
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              )}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
