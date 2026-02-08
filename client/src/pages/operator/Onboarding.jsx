import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { autoImportBrand, createBrandProfile, uploadImages } from '../../api';
import ProgressBar from '../../components/common/ProgressBar';
import OnboardingStepImport from '../../components/operator/OnboardingStepImport';
import OnboardingStepBrand from '../../components/operator/OnboardingStepBrand';
import OnboardingStepBudget from '../../components/operator/OnboardingStepBudget';
import OnboardingStepConfirm from '../../components/operator/OnboardingStepConfirm';

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
    form.guestExperienceKeywords.length > 0;

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

        {step === 0 && (
          <OnboardingStepImport
            importUrl={importUrl}
            setImportUrl={setImportUrl}
            importing={importing}
            importError={importError}
            onImport={handleImport}
            onSkip={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <OnboardingStepBrand
            form={form}
            updateForm={updateForm}
            toggleArrayItem={toggleArrayItem}
            setSingleSelect={setSingleSelect}
            updateVibeScale={updateVibeScale}
            keywordInput={keywordInput}
            setKeywordInput={setKeywordInput}
            addKeyword={addKeyword}
            removeKeyword={removeKeyword}
            visualRefUploading={visualRefUploading}
            visualRefError={visualRefError}
            onVisualRefsSelected={handleVisualRefsSelected}
            canProceed={canProceedFromStep1}
            onBack={back}
            onNext={next}
          />
        )}

        {step === 2 && (
          <OnboardingStepBudget
            form={form}
            updateForm={updateForm}
            canProceed={canProceedFromStep2}
            onBack={back}
            onNext={next}
          />
        )}

        {step === 3 && (
          <OnboardingStepConfirm
            form={form}
            saving={saving}
            saveError={saveError}
            onBack={back}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
