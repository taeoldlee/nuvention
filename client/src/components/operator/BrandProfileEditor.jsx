import { useState } from 'react';
import { updateBrandProfile } from '../../api';
import { useToast } from '../../contexts/ToastContext';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';
const labelClass = 'block text-sm font-medium text-dark mb-1.5 font-body';

export default function BrandProfileEditor({ profile }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    businessName: profile?.businessName || '',
    neighborhood: profile?.neighborhood || '',
    city: profile?.city || '',
    state: profile?.state || '',
    googleMapsUrl: profile?.googleMapsUrl || '',
    contentNoGos: profile?.contentNoGos || '',
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
      });
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
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent text-white font-body font-semibold text-base hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
