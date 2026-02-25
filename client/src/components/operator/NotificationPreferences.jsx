import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

const PREFS = [
  {
    id: 'newApplication',
    label: 'New application received',
    description: 'When a creator applies to one of your briefs.',
    defaultOn: true,
  },
  {
    id: 'creatorResponse',
    label: 'Creator response',
    description: 'When a creator accepts or declines your project offer.',
    defaultOn: true,
  },
  {
    id: 'draftSubmission',
    label: 'Draft submission',
    description: 'When a creator submits content for your review.',
    defaultOn: true,
  },
  {
    id: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'A summary of your active campaigns every Monday.',
    defaultOn: false,
  },
];

export default function NotificationPreferences() {
  const { addToast } = useToast();
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(PREFS.map((p) => [p.id, p.defaultOn]))
  );

  const toggle = (id) => {
    setPrefs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      addToast(`Notification preference updated.`, 'success');
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {PREFS.map((pref) => (
        <div
          key={pref.id}
          className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-white hover:border-accent/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark font-body">{pref.label}</p>
            <p className="text-xs text-muted font-body mt-0.5">{pref.description}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs[pref.id]}
            onClick={() => toggle(pref.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              prefs[pref.id] ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                prefs[pref.id] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
      <p className="text-xs text-muted font-body pt-2 px-1">
        Preferences are saved locally for demo purposes.
      </p>
    </div>
  );
}
