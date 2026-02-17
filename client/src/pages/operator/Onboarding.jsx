import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { autoImportBrand, createBrandProfile, analyzeBrandFromPlace } from '../../api';
import useOnboardingForm from '../../hooks/useOnboardingForm';
import useGooglePlaces from '../../hooks/useGooglePlaces';
import ProgressBar from '../../components/common/ProgressBar';
import OnboardingStepSearch from '../../components/operator/OnboardingStepSearch';
import OnboardingStepImport from '../../components/operator/OnboardingStepImport';
import OnboardingStepReview from '../../components/operator/OnboardingStepReview';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const formActions = useOnboardingForm();
  const { isLoaded: placesLoaded, isAvailable: placesAvailable } = useGooglePlaces();

  const { form } = formActions;

  // Determine flow: Google Places (2-step) or URL paste fallback (2-step)
  const useGoogleFlow = placesAvailable && placesLoaded;
  const STEPS = ['Search', 'Review'];

  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fallback URL import state (when no Google Places key)
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Google Places: user selected a place from autocomplete
  const handlePlaceSelected = async (placeData) => {
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const res = await analyzeBrandFromPlace(placeData);
      const data = res.data?.data || res.data;
      formActions.applyImportData(data);
      // Also store Google Maps URL and photo URLs as visual refs
      if (placeData.googleMapsUrl) {
        formActions.updateForm('googleMapsUrl', placeData.googleMapsUrl);
      }
      setStep(1);
    } catch (err) {
      setAnalyzeError(
        err.response?.data?.error || 'Analysis failed. Try searching again or set up manually.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Fallback: URL paste import
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

  // Manual setup: skip to review with empty form
  const handleManualSetup = () => {
    setStep(1);
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
            {step === 0
              ? 'Find your business and we\'ll handle the rest.'
              : 'Review and tweak your AI-generated profile.'}
          </p>
        </div>

        <ProgressBar steps={STEPS} currentStep={step} className="mb-10" />

        {step === 0 && useGoogleFlow && (
          <OnboardingStepSearch
            analyzing={analyzing}
            error={analyzeError}
            onPlaceSelected={handlePlaceSelected}
            onManualSetup={handleManualSetup}
          />
        )}

        {step === 0 && !useGoogleFlow && (
          <OnboardingStepImport
            importUrl={importUrl}
            setImportUrl={setImportUrl}
            importing={importing}
            importError={importError}
            onImport={handleImport}
            onSkip={handleManualSetup}
          />
        )}

        {step === 1 && (
          <OnboardingStepReview
            formActions={formActions}
            saving={saving}
            saveError={saveError}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
