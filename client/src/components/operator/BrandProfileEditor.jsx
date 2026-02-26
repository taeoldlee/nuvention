import { useState } from 'react';
import { updateBrandProfile } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Btn from '../common/Btn';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';
const labelClass = 'block text-sm font-medium text-dark mb-1.5 font-body';

function TagInput({ label, tags, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const handleRemove = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-bgTan text-mid border border-border"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="ml-0.5 hover:text-red-500 transition-colors"
              title="Remove"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={inputClass}
          placeholder={placeholder || `Add a ${label.toLowerCase().replace(/s$/, '')}...`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-3 py-3 rounded-xl text-sm font-medium text-accent border border-accent/20 bg-accentLight hover:bg-accent hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function BrandProfileEditor({ profile }) {
  const { addToast } = useToast();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    businessName: profile?.businessName || '',
    neighborhood: profile?.neighborhood || '',
    city: profile?.city || '',
    state: profile?.state || '',
    googleMapsUrl: profile?.googleMapsUrl || '',
    contentNoGos: profile?.contentNoGos || '',
    cuisineTypes: Array.isArray(profile?.cuisineTypes) ? profile.cuisineTypes : [],
    vibe: Array.isArray(profile?.vibe) ? profile.vibe : [],
    values: Array.isArray(profile?.values) ? profile.values : [],
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.businessName.trim()) {
      addToast('Business name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateBrandProfile({
        businessName: form.businessName.trim(),
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        googleMapsUrl: form.googleMapsUrl.trim() || null,
        contentNoGos: form.contentNoGos.trim() || null,
        cuisineTypes: form.cuisineTypes,
        vibe: form.vibe,
        values: form.values,
      });
      await refreshProfile();
      addToast('Profile saved successfully.', 'success');
    } catch {
      addToast('Could not save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Business Name</label>
        <input
          type="text"
          value={form.businessName}
          onChange={(e) => updateField('businessName', e.target.value)}
          className={inputClass}
          placeholder="Your restaurant name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Neighborhood</label>
          <input
            type="text"
            value={form.neighborhood}
            onChange={(e) => updateField('neighborhood', e.target.value)}
            className={inputClass}
            placeholder="e.g. Evanston"
          />
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={inputClass}
            placeholder="e.g. Chicago"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Google Maps URL <span className="text-muted font-normal">(optional)</span></label>
        <input
          type="url"
          value={form.googleMapsUrl}
          onChange={(e) => updateField('googleMapsUrl', e.target.value)}
          className={inputClass}
          placeholder="https://maps.google.com/..."
        />
      </div>

      <TagInput
        label="Cuisine Types"
        tags={form.cuisineTypes}
        onChange={(tags) => updateField('cuisineTypes', tags)}
        placeholder="e.g. Italian, Coffee & Beverage..."
      />

      <TagInput
        label="Vibe"
        tags={form.vibe}
        onChange={(tags) => updateField('vibe', tags)}
        placeholder="e.g. Cozy & Warm, Minimalist..."
      />

      <TagInput
        label="Values"
        tags={form.values}
        onChange={(tags) => updateField('values', tags)}
        placeholder="e.g. Community-first, Sustainability..."
      />

      <div>
        <label className={labelClass}>Content No-Gos <span className="text-muted font-normal">(optional)</span></label>
        <textarea
          value={form.contentNoGos}
          onChange={(e) => updateField('contentNoGos', e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Anything creators should never show or mention..."
        />
      </div>

      <div className="flex justify-end pt-2">
        <Btn onClick={handleSave} loading={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Btn>
      </div>
    </div>
  );
}
