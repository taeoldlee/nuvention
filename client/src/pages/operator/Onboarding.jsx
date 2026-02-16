import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { autoImportBrand, createBrandProfile } from '../../api';
import useOnboardingForm from '../../hooks/useOnboardingForm';
import ProgressBar from '../../components/common/ProgressBar';
import OnboardingStepImport from '../../components/operator/OnboardingStepImport';
import OnboardingStepBrand from '../../components/operator/OnboardingStepBrand';
import OnboardingStepCuisine from '../../components/operator/OnboardingStepCuisine';
import OnboardingStepBudget from '../../components/operator/OnboardingStepBudget';
import OnboardingStepConfirm from '../../components/operator/OnboardingStepConfirm';

const STEPS = ['Import', 'Brand', 'Cuisine', 'Budget', 'Confirm'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const formActions = useOnboardingForm();

  // Redirect to landing if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const { form } = formActions;

  const [step, setStep] = useState(0);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      const res = await autoImportBrand(importUrl.trim());
      const data = res.data?.data || res.data;
      formActions.applyImportData(data);
      if (res.data?.source === 'manual') {
        addToast('Could not auto-detect brand info. Please fill in manually.', 'info');
      }
      setStep(1);
    } catch (err) {
      setImportError(
        err.response?.data?.error || 'Could not import. Try setting up manually.'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await createBrandProfile({
        businessName: form.businessName,
        neighborhood: formActions.effectiveNeighborhood,
        vibe: form.vibes,
        vibes: form.vibes,
        values: form.values,
        contentComfortZones: form.contentComfortZones,
        vibeScales: form.vibeScales,
        guestExperienceKeywords: form.guestExperienceKeywords,
        visualRefUrls: form.visualRefUrls,
        cuisineTypes: form.cuisineTypes,
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

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-dark mb-2">
            Set up your brand
          </h1>
          <p className="font-body text-muted">
            Tell us about your business so we can find the right creators.
          </p>
        </div>

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
            formActions={formActions}
            onBack={back}
            onNext={next}
          />
        )}

        {step === 2 && (
          <OnboardingStepCuisine
            formActions={formActions}
            onBack={back}
            onNext={next}
          />
        )}

        {step === 3 && (
          <OnboardingStepBudget
            formActions={formActions}
            onBack={back}
            onNext={next}
          />
        )}

        {step === 4 && (
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
