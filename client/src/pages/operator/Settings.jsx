import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getBrandProfile, updateBrandProfile } from '../../api';
import {
  NEIGHBORHOODS,
  VIBE_OPTIONS,
  VALUE_OPTIONS,
  CONTENT_COMFORT_ZONES,
  VIBE_SCALES,
} from '../../utils/constants';
import Chip from '../../components/common/Chip';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Settings() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    neighborhood: '',
    vibes: [],
    values: [],
    contentComfortZones: [],
    vibeScales: {
      cozyEnergetic: 50,
      quietBuzzy: 50,
      classicModern: 50,
      casualElevated: 50,
    },
    guestExperienceKeywords: [],
    budgetMin: 100,
    budgetMax: 500,
    contentNoGos: '',
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getBrandProfile();
        const p = res.data.profile;
        setForm({
          businessName: p.businessName || '',
          neighborhood: p.neighborhood || '',
          vibes: p.vibe || [],
          values: p.values || [],
          contentComfortZones: p.contentComfortZones || [],
          vibeScales: p.vibeScales || {
            cozyEnergetic: 50,
            quietBuzzy: 50,
            classicModern: 50,
            casualElevated: 50,
          },
          guestExperienceKeywords: p.guestExperienceKeywords || [],
          budgetMin: p.budgetMin ? p.budgetMin / 100 : 100,
          budgetMax: p.budgetMax ? p.budgetMax / 100 : 500,
          contentNoGos: p.contentNoGos || '',
        });
      } catch (err) {
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess('');
  };

  const toggleArrayItem = (field, item) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(item)
          ? arr.filter((v) => v !== item)
          : [...arr, item],
      };
    });
    setSuccess('');
  };

  const setSingleSelect = (field, item) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field] === item ? '' : item,
    }));
    setSuccess('');
  };

  const updateVibeScale = (key, value) => {
    setForm((prev) => ({
      ...prev,
      vibeScales: { ...prev.vibeScales, [key]: value },
    }));
    setSuccess('');
  };

  const addKeyword = () => {
    const value = keywordInput.trim().toLowerCase();
    if (!value) return;
    setForm((prev) => {
      if (prev.guestExperienceKeywords.includes(value)) return prev;
      if (prev.guestExperienceKeywords.length >= 3) return prev;
      return {
        ...prev,
        guestExperienceKeywords: [...prev.guestExperienceKeywords, value],
      };
    });
    setKeywordInput('');
    setSuccess('');
  };

  const removeKeyword = (keyword) => {
    setForm((prev) => ({
      ...prev,
      guestExperienceKeywords: prev.guestExperienceKeywords.filter((k) => k !== keyword),
    }));
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateBrandProfile({
        businessName: form.businessName,
        neighborhood: form.neighborhood,
        vibe: form.vibes,
        vibes: form.vibes,
        values: form.values,
        contentComfortZones: form.contentComfortZones,
        vibeScales: form.vibeScales,
        guestExperienceKeywords: form.guestExperienceKeywords,
        budgetMin: form.budgetMin * 100,
        budgetMax: form.budgetMax * 100,
        contentNoGos: form.contentNoGos,
      });
      await refreshProfile();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-dark mb-1">
              Profile Settings
            </h1>
            <p className="font-body text-muted text-sm">
              Update your brand profile and preferences.
            </p>
          </div>
          <Btn variant="ghost" onClick={() => navigate('/operator/dashboard')}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </Btn>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-700 font-body">{success}</p>
          </div>
        )}

        <div className="card space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">
              Business Name
            </label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => updateForm('businessName', e.target.value)}
              placeholder="e.g. The Bourgeois Pig"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          {/* Neighborhood */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">
              Neighborhood
            </label>
            <div className="flex flex-wrap gap-2">
              {NEIGHBORHOODS.map((n) => (
                <Chip
                  key={n}
                  label={n}
                  selected={form.neighborhood === n}
                  onClick={() => setSingleSelect('neighborhood', n)}
                />
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">
              Vibe <span className="text-muted font-normal">(select all that fit)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  selected={form.vibes.includes(v)}
                  onClick={() => toggleArrayItem('vibes', v)}
                />
              ))}
            </div>
          </div>

          {/* Vibe Scales */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-dark font-body">
              Vibe scales <span className="text-muted font-normal">(sliders)</span>
            </label>
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

          {/* Values */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">
              Values <span className="text-muted font-normal">(select all that fit)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {VALUE_OPTIONS.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  selected={form.values.includes(v)}
                  onClick={() => toggleArrayItem('values', v)}
                />
              ))}
            </div>
          </div>

          {/* Guest Experience Keywords */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">
              Guest experience keywords <span className="text-muted font-normal">(1-3 words)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                placeholder="e.g. warm, neighborhood, slow"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
              <Btn size="sm" onClick={addKeyword} disabled={form.guestExperienceKeywords.length >= 3}>
                Add
              </Btn>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.guestExperienceKeywords.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-bgTan text-mid border border-border"
                >
                  {k}
                  <button
                    type="button"
                    onClick={() => removeKeyword(k)}
                    className="hover:text-dark"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-muted mt-2 font-body">
              {form.guestExperienceKeywords.length}/3 selected
            </p>
          </div>

          {/* Content Comfort Zones */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">
              Content comfort zones{' '}
              <span className="text-muted font-normal">(what you want shot)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_COMFORT_ZONES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={form.contentComfortZones.includes(c)}
                  onClick={() => toggleArrayItem('contentComfortZones', c)}
                />
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">
              Budget Range (per project)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1 font-body">Min ($)</label>
                <input
                  type="number"
                  value={form.budgetMin}
                  onChange={(e) => updateForm('budgetMin', Number(e.target.value))}
                  min={0}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1 font-body">Max ($)</label>
                <input
                  type="number"
                  value={form.budgetMax}
                  onChange={(e) => updateForm('budgetMax', Number(e.target.value))}
                  min={0}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Content No-Gos */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">
              Content No-Gos <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={form.contentNoGos}
              onChange={(e) => updateForm('contentNoGos', e.target.value)}
              placeholder="Anything you'd rather creators avoid..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
            />
          </div>

          {/* Save */}
          <div className="pt-4 border-t border-border flex justify-end">
            <Btn onClick={handleSave} loading={saving}>
              Save Changes
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
