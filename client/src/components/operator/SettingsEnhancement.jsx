import { useState } from 'react';
import BrandProfileEditor from './BrandProfileEditor';
import SubscriptionCard from './SubscriptionCard';
import NotificationPreferences from './NotificationPreferences';
import DataExport from './DataExport';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'data', label: 'Data' },
];

export default function SettingsEnhancement({ profile }) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="mt-8">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium font-body whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-dark hover:border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-dark mb-5">Edit Profile</h2>
          <BrandProfileEditor profile={profile} />
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-dark mb-5">Subscription</h2>
          <SubscriptionCard profile={profile} />
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-dark mb-5">Notification Preferences</h2>
          <NotificationPreferences />
        </div>
      )}

      {activeTab === 'data' && (
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-dark mb-5">Data Export</h2>
          <DataExport />
        </div>
      )}
    </div>
  );
}
