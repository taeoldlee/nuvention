import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { autoImportBrand, createBrandProfile, uploadImages } from '../../api';
import {
  NEIGHBORHOODS,
  VIBE_OPTIONS,
  VALUE_OPTIONS,
  CONTENT_COMFORT_ZONES,
} from '../../utils/constants';
import ProgressBar from '../../components/common/ProgressBar';
import Btn from '../../components/common/Btn';
import Chip from '../../components/common/Chip';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STEPS = ['Import', 'Brand', 'Budget', 'Confirm'];
const VIBE_SCALES = [
  { key: 'cozyEnergetic', left: 'Cozy', right: 'Energetic' },
  { key: 'quietBuzzy', left: 'Quiet', right: 'Buzzy' },
  { key: 'classicModern', left: 'Classic', right: 'Modern' },
  { key: 'casualElevated', left: 'Casual', right: 'Elevated' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [visualRefUploading, setVisualRefUploading] = useState(false);
  const [visualRefError, setVisualRefError] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  // Form state
  const [form, setForm] = useState({
    businessName: '',
    neighborhood: '',
    vibes: [],
    values: [],
    contentComfortZones: [],
    vibeScales: {
      cozyEnergetic: 50,
      quietBuzzy: 50,
      classicModern: 50,
      casualElevated: 50,
    },
    guestExperienceKeywords: [],
    visualRefUrls: [],
    budgetMin: 100,
    budgetMax: 500,
    contentNoGos: '',
  });

  // ─── Step helpers ───
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(item)
          ? arr.filter((v) => v !== item)
          : [...arr, item],
      };
    });
  };

  const setSingleSelect = (field, item) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field] === item ? '' : item,
    }));
  };

  const updateVibeScale = (key, value) => {
    setForm((prev) => ({
      ...prev,
      vibeScales: {
        ...prev.vibeScales,
        [key]: value,
      },
    }));
  };

  const addKeyword = () => {
    const value = keywordInput.trim().toLowerCase();
    if (!value) return;
    setForm((prev) => {
      if (prev.guestExperienceKeywords.includes(value)) return prev;
      if (prev.guestExperienceKeywords.length >= 3) return prev;
      return {
        ...prev,
        guestExperienceKeywords: [...prev.guestExperienceKeywords, value],
      };
    });
    setKeywordInput('');
  };

  const removeKeyword = (keyword) => {
    setForm((prev) => ({
      ...prev,
      guestExperienceKeywords: prev.guestExperienceKeywords.filter((k) => k !== keyword),
    }));
  };

  // ─── Auto-import ───
  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      const res = await autoImportBrand(importUrl.trim());
      const data = res.data?.data || res.data;
      setForm((prev) => ({
        ...prev,
        businessName: data.businessName || prev.businessName,
        neighborhood: data.neighborhood || prev.neighborhood,
        vibes: (data.vibe?.length ? data.vibe : data.vibes) || prev.vibes,
        values: data.values?.length ? data.values : prev.values,
        contentComfortZones: data.contentComfortZones?.length
          ? data.contentComfortZones
          : prev.contentComfortZones,
      }));
      setStep(1);
    } catch (err) {
      setImportError(
        err.response?.data?.error || 'Could not import. Try setting up manually.'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleVisualRefsSelected = async (files) => {
    const selected = Array.from(files || []).slice(0, 5);
    if (selected.length === 0) return;
    setVisualRefUploading(true);
    setVisualRefError('');
    try {
      const formData = new FormData();
      selected.forEach((file) => formData.append('images', file));
      const res = await uploadImages(formData);
      const urls = (res.data.images || []).map((img) => img.url);
      setForm((prev) => {
        const merged = [...prev.visualRefUrls, ...urls].slice(0, 5);
        return { ...prev, visualRefUrls: merged };
      });
    } catch (err) {
      setVisualRefError(
        err.response?.data?.error || 'Could not upload references. Try again.'
      );
    } finally {
      setVisualRefUploading(false);
    }
  };

  // ─── Submit ───
  const handleSubmit = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await createBrandProfile({
        businessName: form.businessName,
        neighborhood: form.neighborhood,
        vibe: form.vibes,
        vibes: form.vibes,
        values: form.values,
        contentComfortZones: form.contentComfortZones,
        vibeScales: form.vibeScales,
        guestExperienceKeywords: form.guestExperienceKeywords,
        visualRefUrls: form.visualRefUrls,
        budgetMin: form.budgetMin * 100,
        budgetMax: form.budgetMax * 100,
        contentNoGos: form.contentNoGos,
      });
      await refreshProfile();
      navigate('/operator/dashboard');
    } catch (err) {
      setSaveError(
        err.response?.data?.error || 'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ─── Validation ───
  const canProceedFromStep1 =
    form.businessName.trim() &&
    form.neighborhood &&
    form.vibes.length > 0 &&
    form.values.length > 0 &&
    form.contentComfortZones.length > 0 &&
    form.guestExperienceKeywords.length === 3 &&
    form.visualRefUrls.length >= 3;

  const canProceedFromStep2 =
    form.budgetMin > 0 && form.budgetMax >= form.budgetMin;

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-dark mb-2">
            Set up your brand
          </h1>
          <p className="font-body text-muted">
            Tell us about your business so we can find the right creators.
          </p>
        </div>

        {/* Progress */}
        <ProgressBar steps={STEPS} currentStep={step} className="mb-10" />

        {/* ─── Step 0: Auto-Import ─── */}
        {step === 0 && (
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-accentLight mx-auto mb-4 flex items-center justify-center">
                <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-dark mb-1">
                Quick setup
              </h2>
              <p className="font-body text-sm text-muted">
                Paste your Google Maps or Yelp link and we'll fill in the details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5 font-body">
                  Business URL
                </label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://maps.google.com/... or https://yelp.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>

              {importError && (
                <p className="text-sm text-red-600 font-body">{importError}</p>
              )}

              {importing ? (
                <LoadingSpinner message="Analyzing your brand..." />
              ) : (
                <Btn onClick={handleImport} disabled={!importUrl.trim()} className="w-full">
                  Import
                </Btn>
              )}

              <div className="text-center pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-muted hover:text-dark font-body underline underline-offset-2 transition-colors"
                >
                  Set up manually instead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 1: Brand Identity ─── */}
        {step === 1 && (
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
                Guest experience keywords <span className="text-muted font-normal">(3 words)</span>
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
                Visual references <span className="text-muted font-normal">(upload 3–5)</span>
              </label>
              <div className="border border-dashed border-border rounded-xl p-4 bg-bgWarm text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleVisualRefsSelected(e.target.files)}
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
              <Btn variant="ghost" onClick={back}>
                Back
              </Btn>
              <Btn onClick={next} disabled={!canProceedFromStep1}>
                Continue
              </Btn>
            </div>
          </div>
        )}

        {/* ─── Step 2: Budget & Preferences ─── */}
        {step === 2 && (
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
              <Btn variant="ghost" onClick={back}>
                Back
              </Btn>
              <Btn onClick={next} disabled={!canProceedFromStep2}>
                Continue
              </Btn>
            </div>
          </div>
        )}

        {/* ─── Step 3: Confirmation ─── */}
        {step === 3 && (
          <div className="card space-y-6">
            <h2 className="font-display text-xl font-semibold text-dark">
              Looks good?
            </h2>
            <p className="text-sm text-muted font-body">
              Review your profile before we start matching.
            </p>

            <div className="bg-bgWarm rounded-xl p-5 space-y-4">
              {/* Business Name */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
                  Business
                </p>
                <p className="text-dark font-semibold font-body">
                  {form.businessName}
                </p>
              </div>

              {/* Neighborhood */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
                  Neighborhood
                </p>
                <p className="text-dark font-body">{form.neighborhood}</p>
              </div>

              {/* Vibe */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                  Vibe
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {form.vibes.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                  Values
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {form.values.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Comfort Zones */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                  Content zones
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {form.contentComfortZones.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vibe Scales */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                  Vibe scales
                </p>
                <div className="space-y-2">
                  {VIBE_SCALES.map((scale) => (
                    <div key={scale.key} className="text-sm text-dark font-body">
                      {scale.left} ↔ {scale.right}: {form.vibeScales[scale.key]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Guest Experience Keywords */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                  Guest experience
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {form.guestExperienceKeywords.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-bgTan text-mid border border-border"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual References */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                  Visual references
                </p>
                {form.visualRefUrls.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {form.visualRefUrls.map((url, idx) => (
                      <div key={url + idx} className="aspect-square rounded-lg overflow-hidden border border-border bg-bgTan">
                        <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted font-body">No references uploaded</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
                  Budget
                </p>
                <p className="text-dark font-body">
                  ${form.budgetMin} &ndash; ${form.budgetMax} per piece
                </p>
              </div>

              {/* No-Gos */}
              {form.contentNoGos && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
                    No-go's
                  </p>
                  <p className="text-dark font-body text-sm">
                    {form.contentNoGos}
                  </p>
                </div>
              )}
            </div>

            {saveError && (
              <p className="text-sm text-red-600 font-body">{saveError}</p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Btn variant="ghost" onClick={back}>
                Back
              </Btn>
              <Btn onClick={handleSubmit} loading={saving}>
                Create Profile
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
