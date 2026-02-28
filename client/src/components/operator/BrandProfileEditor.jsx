import { useState } from 'react';
import { updateBrandProfile } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  BRAND_GOAL_CATEGORIES,
  CONTENT_COMFORT_ZONES,
  VIBE_SCALES,
} from '../../utils/constants';
import Btn from '../common/Btn';
import Chip from '../common/Chip';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';
const labelClass = 'block text-sm font-medium text-dark mb-1.5 font-body';

function TagInput({ label, tags, onChange, placeholder, max }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      if (max && tags.length >= max) return;
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
          disabled={!input.trim() || (max && tags.length >= max)}
          className="px-3 py-3 rounded-xl text-sm font-medium text-accent border border-accent/20 bg-accentLight hover:bg-accent hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="pt-4 pb-1">
      <p className="text-xs text-muted font-body uppercase tracking-wide font-semibold">{label}</p>
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
    brandGoals: profile?.brandGoals || null,
    contentComfortZones: Array.isArray(profile?.contentComfortZones) ? profile.contentComfortZones : [],
    vibeScales: profile?.vibeScales || { cozyEnergetic: 50, quietBuzzy: 50, classicModern: 50, casualElevated: 50 },
    guestExperienceKeywords: Array.isArray(profile?.guestExperienceKeywords) ? profile.guestExperienceKeywords : [],
    budgetMin: profile?.budgetMin != null ? Math.round(profile.budgetMin / 100) : 100,
    budgetMax: profile?.budgetMax != null ? Math.round(profile.budgetMax / 100) : 500,
    visualRefUrls: Array.isArray(profile?.visualRefUrls) ? profile.visualRefUrls : [],
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleComfortZone = (zone) => {
    setForm((prev) => ({
      ...prev,
      contentComfortZones: prev.contentComfortZones.includes(zone)
        ? prev.contentComfortZones.filter((z) => z !== zone)
        : [...prev.contentComfortZones, zone],
    }));
  };

  const updateVibeScale = (key, value) => {
    setForm((prev) => ({
      ...prev,
      vibeScales: { ...prev.vibeScales, [key]: value },
    }));
  };

  const handleGoalSelect = (goal, category) => {
    updateField('brandGoals', {
      primary: goal.key,
      category: category.category,
      label: goal.label,
    });
  };

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
        brandGoals: form.brandGoals,
        contentComfortZones: form.contentComfortZones,
        vibeScales: form.vibeScales,
        guestExperienceKeywords: form.guestExperienceKeywords,
        budgetMin: form.budgetMin * 100,
        budgetMax: form.budgetMax * 100,
        visualRefUrls: form.visualRefUrls,
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

      {/* Brand Goal */}
      <SectionDivider label="Brand Goal" />
      <div>
        <label className={labelClass}>Your #1 goal right now</label>
        <div className="space-y-3">
          {BRAND_GOAL_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <p className="text-xs font-semibold text-mid font-body uppercase tracking-wide mb-1.5">
                {cat.label}
              </p>
              <div className="space-y-1.5">
                {cat.goals.map((goal) => {
                  const isSelected = form.brandGoals?.primary === goal.key;
                  return (
                    <button
                      key={goal.key}
                      type="button"
                      onClick={() => handleGoalSelect(goal, cat)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-body transition-all ${
                        isSelected
                          ? 'border-accent bg-accentLight text-dark ring-2 ring-accent/30'
                          : 'border-border bg-white text-dark hover:border-accent/40 hover:bg-accent/5'
                      }`}
                    >
                      {goal.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Comfort Zones */}
      <SectionDivider label="Content Preferences" />
      <div>
        <label className={labelClass}>Content Comfort Zones</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_COMFORT_ZONES.map((zone) => (
            <Chip
              key={zone}
              label={zone}
              selected={form.contentComfortZones.includes(zone)}
              onClick={() => toggleComfortZone(zone)}
            />
          ))}
        </div>
      </div>

      {/* Vibe Scales */}
      <div>
        <label className={labelClass}>Vibe Scales</label>
        <div className="space-y-3">
          {VIBE_SCALES.map((scale) => (
            <div key={scale.key}>
              <div className="flex items-center justify-between text-xs text-muted font-body mb-1">
                <span>{scale.left}</span>
                <span>{scale.right}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.vibeScales[scale.key] ?? 50}
                onChange={(e) => updateVibeScale(scale.key, Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Guest Experience Keywords */}
      <TagInput
        label="Guest Experience Keywords"
        tags={form.guestExperienceKeywords}
        onChange={(tags) => updateField('guestExperienceKeywords', tags)}
        placeholder="e.g. warm, neighborhood, slow"
        max={5}
      />

      {/* Budget */}
      <SectionDivider label="Budget" />
      <div>
        <label className={labelClass}>Budget per piece of content</label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1 font-body">Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-body text-sm">$</span>
              <input
                type="number"
                min={50}
                max={form.budgetMax}
                value={form.budgetMin}
                onChange={(e) => updateField('budgetMin', Number(e.target.value))}
                className="w-full pl-7 pr-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>
          </div>
          <span className="text-muted mt-5">--</span>
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1 font-body">Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-body text-sm">$</span>
              <input
                type="number"
                min={form.budgetMin}
                max={2000}
                value={form.budgetMax}
                onChange={(e) => updateField('budgetMax', Number(e.target.value))}
                className="w-full pl-7 pr-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual References */}
      <SectionDivider label="Visual References" />
      {form.visualRefUrls.length > 0 && (
        <div>
          <label className={labelClass}>Reference Images</label>
          <div className="grid grid-cols-3 gap-2">
            {form.visualRefUrls.map((url, idx) => (
              <div key={url + idx} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-bgTan group">
                <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  aria-label={`Remove reference ${idx + 1}`}
                  onClick={() => updateField('visualRefUrls', form.visualRefUrls.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-dark/70 text-white flex items-center justify-center text-xs hover:bg-dark transition-colors opacity-0 group-hover:opacity-100"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content No-Gos */}
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
