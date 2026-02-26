import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { updateBrandProfile } from '../../api';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SettingsEnhancement from '../../components/operator/SettingsEnhancement';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';
const labelClass = 'text-xs text-muted font-body uppercase tracking-wide mb-1';

function PencilIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/** Inline-editable text field */
function EditableField({ label, value, displayValue, fieldKey, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const handleSave = async () => {
    await onSave(fieldKey, draft.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div>
        <p className={labelClass}>{label}</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={inputClass}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="p-2 rounded-lg text-accent hover:bg-accentLight transition-colors disabled:opacity-50"
            title="Save"
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-lg text-muted hover:bg-bgWarm transition-colors"
            title="Cancel"
          >
            <XIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <p className={labelClass}>{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm text-dark font-body">{displayValue || value || '--'}</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accentLight transition-all"
          title={`Edit ${label.toLowerCase()}`}
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Inline-editable tag list (for arrays like vibe, values, cuisineTypes) */
function EditableTagField({ label, tags, fieldKey, onSave, saving, tagStyle = 'default' }) {
  const [editing, setEditing] = useState(false);
  const [draftTags, setDraftTags] = useState(tags || []);
  const [newTag, setNewTag] = useState('');

  const tagStyles = {
    accent: 'bg-accentLight text-accent border-accent/20',
    default: 'bg-bgTan text-mid border-border',
  };
  const style = tagStyles[tagStyle] || tagStyles.default;

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !draftTags.includes(trimmed)) {
      setDraftTags([...draftTags, trimmed]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setDraftTags(draftTags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    await onSave(fieldKey, draftTags);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraftTags(tags || []);
    setNewTag('');
    setEditing(false);
  };

  if (editing) {
    return (
      <div>
        <p className={labelClass}>{label}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {draftTags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${style}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-0.5 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className={inputClass}
            placeholder={`Add a ${label.toLowerCase().replace(/s$/, '')}...`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="px-3 py-3 rounded-xl text-sm font-medium text-accent border border-accent/20 bg-accentLight hover:bg-accent hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Btn size="sm" onClick={handleSave} loading={saving}>
            Save {label}
          </Btn>
          <Btn size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <p className={labelClass}>{label}</p>
      <div className="flex items-start justify-between">
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${style}`}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted font-body italic">None set</p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accentLight transition-all flex-shrink-0 ml-2"
          title={`Edit ${label.toLowerCase()}`}
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-muted font-body mb-4">No brand profile found.</p>
            <Btn onClick={() => navigate('/operator/onboarding')}>Set Up Profile</Btn>
          </div>
        </div>
      </div>
    );
  }

  const vibes = Array.isArray(profile.vibe) ? profile.vibe : [];
  const values = Array.isArray(profile.values) ? profile.values : [];
  const cuisineTypes = Array.isArray(profile.cuisineTypes) ? profile.cuisineTypes : [];

  const handleSaveField = async (fieldKey, value) => {
    setSaving(true);
    try {
      await updateBrandProfile({ [fieldKey]: value });
      await refreshProfile();
      addToast('Profile updated.', 'success');
    } catch {
      addToast('Could not save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const locationDisplay = [profile.neighborhood, profile.city, profile.state]
    .filter(Boolean)
    .join(', ') || '--';

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-dark mb-1">Settings</h1>
            <p className="font-body text-muted text-sm">
              Click any field to edit it inline.
            </p>
          </div>
          <Btn variant="ghost" onClick={() => navigate('/operator/dashboard')}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </Btn>
        </div>

        {/* Profile Card - inline editable */}
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-dark">Brand Profile</h2>
            <span className="text-xs text-muted font-body">Hover a field to edit</span>
          </div>

          {/* Business Name */}
          <EditableField
            label="Business Name"
            value={profile.businessName}
            fieldKey="businessName"
            onSave={handleSaveField}
            saving={saving}
          />

          {/* Neighborhood */}
          <EditableField
            label="Neighborhood"
            value={profile.neighborhood}
            displayValue={locationDisplay}
            fieldKey="neighborhood"
            onSave={handleSaveField}
            saving={saving}
          />

          {/* City */}
          <EditableField
            label="City"
            value={profile.city}
            fieldKey="city"
            onSave={handleSaveField}
            saving={saving}
          />

          {/* Cuisine Types */}
          <EditableTagField
            label="Cuisine Types"
            tags={cuisineTypes}
            fieldKey="cuisineTypes"
            onSave={handleSaveField}
            saving={saving}
            tagStyle="accent"
          />

          {/* Vibe Tags */}
          <EditableTagField
            label="Vibe"
            tags={vibes}
            fieldKey="vibe"
            onSave={handleSaveField}
            saving={saving}
          />

          {/* Values */}
          <EditableTagField
            label="Values"
            tags={values}
            fieldKey="values"
            onSave={handleSaveField}
            saving={saving}
          />

          {/* Subscription Info (read-only) */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Plan</p>
            <p className="text-sm text-dark font-body">
              {profile.subscriptionTier || 'BASIC'}{' '}
              <span className="text-muted">
                ({profile.subscriptionStatus || 'TRIAL'})
              </span>
            </p>
          </div>
        </div>

        {/* Account Info */}
        <div className="card mt-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-dark">Account</h2>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Name</p>
            <p className="text-sm text-dark font-body">{user?.name || '--'}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-dark font-body">{user?.email || '--'}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Role</p>
            <p className="text-sm text-dark font-body">{user?.role || '--'}</p>
          </div>
        </div>

        {/* Enhanced Settings Tabs */}
        <SettingsEnhancement profile={profile} />
      </div>
    </div>
  );
}
