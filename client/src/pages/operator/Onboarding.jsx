import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { autoImportBrand, createBrandProfile } from '../../api';
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

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Form state
  const [form, setForm] = useState({
    businessName: '',
    neighborhood: '',
    vibes: [],
    values: [],
    contentComfortZones: [],
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

  // ─── Auto-import ───
  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      const res = await autoImportBrand(importUrl.trim());
      const data = res.data;
      setForm((prev) => ({
        ...prev,
        businessName: data.businessName || prev.businessName,
        neighborhood: data.neighborhood || prev.neighborhood,
        vibes: data.vibes?.length ? data.vibes : prev.vibes,
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

  // ─── Submit ───
  const handleSubmit = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await createBrandProfile({
        businessName: form.businessName,
        neighborhood: form.neighborhood,
        vibes: form.vibes,
        values: form.values,
        contentComfortZones: form.contentComfortZones,
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
    form.contentComfortZones.length > 0;

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
