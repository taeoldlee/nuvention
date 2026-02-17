import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createCreatorProfile, uploadPortfolio, importCreatorSocial } from '../../api';
import useCreatorOnboardingForm from '../../hooks/useCreatorOnboardingForm';
import ProgressBar from '../../components/common/ProgressBar';
import CreatorStepImport from '../../components/creator/CreatorStepImport';
import CreatorStepReview from '../../components/creator/CreatorStepReview';
import CreatorStepDone from '../../components/creator/CreatorStepDone';

const STEPS = ['Import', 'Review', 'Done'];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const formActions = useCreatorOnboardingForm();

  const [step, setStep] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Import & Analyze: call backend to scrape social media and fill profile
  const handleImportAnalyze = async () => {
    setImporting(true);
    setImportError('');
    try {
      const res = await importCreatorSocial({
        instagramHandle: formActions.instagram.trim() || undefined,
        tiktokHandle: formActions.tiktok.trim() || undefined,
      });
      const data = res.data;

      // Apply AI analysis to form
      formActions.applyImportData({
        bio: data.profile?.bio,
        originalBio: data.originalBio,
        contentStyles: data.profile?.contentStyles,
        strengths: data.profile?.strengths,
        neighborhoods: data.profile?.neighborhoods,
        cuisineSpecialties: data.profile?.cuisineSpecialties,
        vibeTags: data.profile?.vibeTags,
        importedPortfolio: data.importedPortfolio,
        confidence: data.confidence,
      });

      // Refresh user profile to pick up saved avatar from social import
      if (data.profilePicUrl) {
        await refreshProfile();
      }

      setStep(1);
    } catch (err) {
      setImportError(
        err.response?.data?.error || 'Import failed. Try again or set up manually.'
      );
    } finally {
      setImporting(false);
    }
  };

  // Skip to manual: go to review with empty form
  const handleSkipToManual = () => {
    setStep(1);
  };

  // Submit profile and optionally upload portfolio
  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await createCreatorProfile(formActions.buildProfileData());
      await refreshProfile();

      // Show Done step immediately
      setSaving(false);
      setStep(2);

      // Upload portfolio files in background if any were selected manually
      if (formActions.portfolioFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();
        formActions.portfolioFiles.forEach((file) => formData.append('images', file));
        uploadPortfolio(formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          },
        }).then(() => {
          setUploading(false);
          setUploadProgress(100);
        }).catch((err) => {
          console.warn('Portfolio upload failed:', err.message);
          setUploading(false);
          setUploadError('Portfolio upload failed. Please try again by refreshing the page.');
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgTan">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-creatorAccent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-dark">Locale</span>
          </div>
          <h1 className="font-display text-xl font-semibold text-dark">Creator Setup</h1>
        </div>

        {step < 2 && (
          <div className="mb-8">
            <ProgressBar steps={STEPS} currentStep={step} creator />
          </div>
        )}

        <div className="card mb-6">
          {step === 0 && (
            <CreatorStepImport
              displayName={formActions.displayName}
              setDisplayName={formActions.setDisplayName}
              instagram={formActions.instagram}
              setInstagram={formActions.setInstagram}
              tiktok={formActions.tiktok}
              setTiktok={formActions.setTiktok}
              importing={importing}
              importError={importError}
              onImport={handleImportAnalyze}
              onSkipToManual={handleSkipToManual}
            />
          )}

          {step === 1 && (
            <CreatorStepReview
              formActions={formActions}
              importedPortfolio={formActions.importedPortfolio}
              onRemovePortfolioItem={formActions.removeImportedPortfolioItem}
              saving={saving}
              error={error}
              onSubmit={handleSubmit}
            />
          )}

          {step === 2 && (
            <CreatorStepDone
              uploading={uploading}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
