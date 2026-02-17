import GooglePlacesSearch from './GooglePlacesSearch';
import Btn from '../common/Btn';

export default function OnboardingStepSearch({
  analyzing,
  analyzeReady,
  error,
  onPlaceSelected,
  onContinue,
  onSearchAgain,
  onManualSetup,
  continueRequested,
}) {
  // Show Continue button state
  const showContinue = analyzing || analyzeReady;
  const continueLoading = (analyzing && continueRequested) || (analyzing && !analyzeReady);

  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-accentLight mx-auto mb-4 flex items-center justify-center">
          <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-dark mb-1">
          Find your business
        </h2>
        <p className="font-body text-sm text-muted">
          Search for your business and we'll set up your profile automatically.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1.5 font-body">
            Business name
          </label>
          <GooglePlacesSearch onPlaceSelected={onPlaceSelected} disabled={analyzing && continueRequested} />
        </div>

        {error && (
          <p className="text-sm text-red-600 font-body">{error}</p>
        )}

        {/* Continue / status area */}
        {showContinue && (
          <div className="space-y-3 pt-2">
            {analyzing && !continueRequested && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted font-body py-2">
                <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing your business with AI...
              </div>
            )}

            {analyzeReady && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-body py-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analysis complete!
              </div>
            )}

            <Btn
              onClick={onContinue}
              loading={analyzing && continueRequested}
              className="w-full"
              size="lg"
            >
              {analyzeReady ? 'Continue' : 'Continue'}
            </Btn>

            <button
              onClick={onSearchAgain}
              className="w-full text-sm text-muted hover:text-dark font-body underline underline-offset-2 transition-colors"
            >
              Search for a different business
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={onManualSetup}
            className="text-sm text-muted hover:text-dark font-body underline underline-offset-2 transition-colors"
          >
            Set up manually instead
          </button>
        </div>
      </div>
    </div>
  );
}
