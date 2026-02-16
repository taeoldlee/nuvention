import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createCreatorProfile, uploadPortfolio } from '../../api';
import useCreatorOnboardingForm from '../../hooks/useCreatorOnboardingForm';
import ProgressBar from '../../components/common/ProgressBar';
import Btn from '../../components/common/Btn';
import CreatorStepProfile from '../../components/creator/CreatorStepProfile';
import CreatorStepStyle from '../../components/creator/CreatorStepStyle';
import CreatorStepPortfolio from '../../components/creator/CreatorStepPortfolio';
import CreatorStepDone from '../../components/creator/CreatorStepDone';

const STEPS = ['Profile', 'Style', 'Portfolio', 'Done'];

// 100MB per-file limit for videos, matching the server
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const formActions = useCreatorOnboardingForm();

  // Redirect to landing if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setUploadProgress(0);
    try {
      // Validate file sizes before uploading
      for (const file of formActions.portfolioFiles) {
        const limit = file.type.startsWith('video/') ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        const limitLabel = file.type.startsWith('video/') ? '100MB' : '10MB';
        if (file.size > limit) {
          throw new Error(`"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum ${limitLabel} for ${file.type.startsWith('video/') ? 'videos' : 'images'}.`);
        }
      }

      await createCreatorProfile(formActions.buildProfileData());
      await refreshProfile();

      // Show "Done" step immediately -- uploads continue in background
      setSaving(false);
      setStep(3);

      if (formActions.portfolioFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();
        formActions.portfolioFiles.forEach((file) => formData.append('images', file));
        uploadPortfolio(formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(pct);
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
      if (err.code === 'ECONNABORTED') {
        setError('Upload timed out. Try smaller files or check your connection.');
      } else {
        setError(err.response?.data?.error || err.message || 'Something went wrong. Please try again.');
      }
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 2) handleSubmit();
    else setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
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

        {step < 3 && (
          <div className="mb-8">
            <ProgressBar steps={STEPS} currentStep={step} creator />
          </div>
        )}

        <div className="card mb-6">
          {step === 0 && <CreatorStepProfile formActions={formActions} />}
          {step === 1 && <CreatorStepStyle formActions={formActions} />}
          {step === 2 && <CreatorStepPortfolio formActions={formActions} />}
          {step === 3 && <CreatorStepDone uploading={uploading} uploadProgress={uploadProgress} uploadError={uploadError} />}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        {step < 3 && (
          <div className="flex items-center justify-between">
            <div>
              {step > 0 && (
                <Btn variant="ghost" creator onClick={handleBack}>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </Btn>
              )}
            </div>
            <Btn creator onClick={handleNext} disabled={!formActions.canProceedFromStep(step)} loading={saving}>
              {step === 2 ? 'Complete Setup' : 'Continue'}
              {step < 2 && (
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              )}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
