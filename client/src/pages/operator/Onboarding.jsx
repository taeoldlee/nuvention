import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { autoImportBrand, createBrandProfile, analyzeBrandFromPlace, normalizeGoal } from '../../api';
import useOnboardingForm from '../../hooks/useOnboardingForm';
import useGooglePlaces from '../../hooks/useGooglePlaces';
import ProgressBar from '../../components/common/ProgressBar';
import OnboardingStepSearch from '../../components/operator/OnboardingStepSearch';
import OnboardingStepImport from '../../components/operator/OnboardingStepImport';
import OnboardingStepReview from '../../components/operator/OnboardingStepReview';
import OnboardingStepGoal from '../../components/operator/OnboardingStepGoal';
import OnboardingStepStyle from '../../components/operator/OnboardingStepStyle';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const formActions = useOnboardingForm();
  const { isLoaded: placesLoaded, isAvailable: placesAvailable } = useGooglePlaces();

  const { form } = formActions;

  const useGoogleFlow = placesAvailable && placesLoaded;
  const STEPS = ['Search', 'Your Brand', 'Your Goal', 'Your Style'];

  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [placeSelected, setPlaceSelected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fallback URL import state
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Track the AI promise so Continue can wait on it
  const aiPromiseRef = useRef(null);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Google Places: user selected a place — start AI silently in background
  const handlePlaceSelected = (placeData) => {
    setPlaceSelected(true);
    setAnalyzing(true);
    setAnalyzeError('');

    // Start AI in background — no visible indicator on search page
    aiPromiseRef.current = analyzeBrandFromPlace(placeData)
      .then((res) => {
        const data = res.data?.data || res.data;
        // Don't pre-fill contentNoGos — let user fill it manually
        if (data.contentNoGos) delete data.contentNoGos;
        formActions.applyImportData(data);
        if (placeData.googleMapsUrl) {
          formActions.updateForm('googleMapsUrl', placeData.googleMapsUrl);
        }
        setAnalyzing(false);
      })
      .catch((err) => {
        setAnalyzeError(
          err.response?.data?.error || 'Analysis failed. You can still fill in your profile manually.'
        );
        setAnalyzing(false);
      });
  };

  // Continue always advances immediately — if AI isn't done, review page shows loading
  const handleContinue = () => {
    setStep(1);
  };

  // User wants to search again
  const handleSearchAgain = () => {
    setPlaceSelected(false);
    setAnalyzing(false);
    setAnalyzeError('');
    aiPromiseRef.current = null;
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
      setStep(1);
    } catch (err) {
      setImportError(
        err.response?.data?.error || 'Could not import. Try setting up manually.'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleManualSetup = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError('');
    try {
      // Resolve brandGoals
      let brandGoals = form.selectedGoal;
      if (!brandGoals && form.customGoalText.trim()) {
        try {
          const res = await normalizeGoal(form.customGoalText.trim());
          const n = res.data?.normalized || res.data;
          brandGoals = {
            primary: n.key,
            category: n.category,
            label: n.label,
            customText: form.customGoalText.trim(),
          };
        } catch {
          // Fallback if normalize fails
          brandGoals = {
            primary: 'get_quality_content',
            category: 'BUILD_MY_BRAND_ONLINE',
            label: 'Get quality content for ads, website, or socials',
            customText: form.customGoalText.trim(),
          };
        }
      }

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
        brandGoals,
        preferredVideoStyle: form.preferredVideoStyle || null,
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
              : step === 1
                ? analyzing
                  ? 'One moment...'
                  : 'Confirm a few details.'
                : step === 2
                  ? 'Pick your top goal.'
                  : 'Pick your visual style.'}
          </p>
        </div>

        <ProgressBar steps={STEPS} currentStep={step} className="mb-10" />

        {step === 0 && useGoogleFlow && (
          <OnboardingStepSearch
            placeSelected={placeSelected}
            error={analyzeError}
            onPlaceSelected={handlePlaceSelected}
            onContinue={handleContinue}
            onSearchAgain={handleSearchAgain}
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
            onNext={() => setStep(2)}
            onBack={() => { setStep(0); setPlaceSelected(false); }}
            analyzing={analyzing}
          />
        )}

        {step === 2 && (
          <OnboardingStepGoal
            formActions={formActions}
            onSubmit={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <OnboardingStepStyle
            formActions={formActions}
            saving={saving}
            saveError={saveError}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
