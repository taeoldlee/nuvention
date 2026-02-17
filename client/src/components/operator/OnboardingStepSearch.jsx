import GooglePlacesSearch from './GooglePlacesSearch';
import Btn from '../common/Btn';

export default function OnboardingStepSearch({
  placeSelected,
  error,
  onPlaceSelected,
  onContinue,
  onSearchAgain,
  onManualSetup,
}) {
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
          <GooglePlacesSearch onPlaceSelected={onPlaceSelected} onReset={onSearchAgain} />
        </div>

        {error && (
          <p className="text-sm text-red-600 font-body">{error}</p>
        )}

        {placeSelected && (
          <div className="pt-2">
            <Btn onClick={onContinue} className="w-full" size="lg">
              Continue
            </Btn>
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
