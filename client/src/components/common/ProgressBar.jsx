export default function ProgressBar({
  steps,
  currentStep,
  creator = false,
  className = '',
}) {
  const accentColor = creator ? 'bg-creatorAccent' : 'bg-accent';

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                  i <= currentStep
                    ? `${accentColor} text-white`
                    : 'bg-border text-muted'
                }`}
              >
                {i < currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  i <= currentStep ? 'text-dark' : 'text-muted'
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-1rem] transition-colors duration-300 ${
                  i < currentStep ? accentColor : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
