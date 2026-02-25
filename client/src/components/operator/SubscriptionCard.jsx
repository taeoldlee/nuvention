import { useToast } from '../../contexts/ToastContext';

const PLANS = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: 'Free',
    features: ['Up to 3 active briefs', 'Basic AI matching', 'Public portal listing', 'Email support'],
    missing: ['Unlimited briefs', 'Priority AI scoring', 'Campaign insights', 'CSV export'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$49/mo',
    features: ['Unlimited active briefs', 'Priority AI scoring', 'Campaign Insights dashboard', 'CSV data export', 'Priority support', 'Advanced analytics'],
    missing: [],
    highlight: true,
  },
];

export default function SubscriptionCard({ profile }) {
  const { addToast } = useToast();
  const currentTier = profile?.subscriptionTier || 'BASIC';
  const currentStatus = profile?.subscriptionStatus || 'TRIAL';

  const handleUpgrade = () => {
    addToast('Upgrade simulated — in production this would open Stripe checkout.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Current plan badge */}
      <div className="flex items-center gap-3 p-4 bg-accentLight rounded-xl border border-accent/20">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-dark font-body">
            Current Plan: <span className="text-accent">{currentTier}</span>
          </p>
          <p className="text-xs text-muted font-body capitalize">{currentStatus.toLowerCase()} status</p>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-5 transition-all ${
              plan.highlight
                ? 'border-accent/30 bg-accentLight/30'
                : 'border-border bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-dark">{plan.name}</h3>
                <p className="text-sm text-muted font-body">{plan.price}</p>
              </div>
              {currentTier === plan.id && (
                <span className="text-[10px] font-semibold text-accent bg-accentLight px-2 py-1 rounded-full border border-accent/20 font-body uppercase tracking-wide">
                  Current
                </span>
              )}
            </div>

            <ul className="space-y-1.5 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs font-body text-dark">
                  <svg className="w-3.5 h-3.5 text-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
              {plan.missing.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs font-body text-muted line-through">
                  <svg className="w-3.5 h-3.5 text-muted/40 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {plan.id === 'PRO' && currentTier !== 'PRO' && (
              <button
                type="button"
                onClick={handleUpgrade}
                className="w-full px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold font-body hover:bg-accent/90 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
