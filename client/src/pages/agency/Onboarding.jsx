import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createAgencyProfile, addRosterCreator } from '../../api';
import Btn from '../../components/common/Btn';

const AGENCY_TYPES = ['Talent Management', 'Content Studio', 'Marketing Agency'];
const SPECIALTY_OPTIONS = [
  'Food & Beverage', 'Lifestyle', 'Hospitality', 'Events',
  'Fashion', 'Health & Wellness', 'Travel', 'Local Business',
];
const PLATFORM_OPTIONS = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'REDNOTE', 'OTHER'];
const STYLE_TAG_OPTIONS = [
  'Clean', 'Minimalist', 'Editorial', 'Warm', 'Bold', 'Energetic',
  'Candid', 'Documentary', 'Lifestyle', 'Story-driven', 'Authentic', 'Community',
];

const EMPTY_CREATOR = {
  name: '', handle: '', platform: 'INSTAGRAM', followerCount: '',
  engagementRate: '', contactEmail: '', contentStyleTags: [], bio: '',
};

export default function AgencyOnboarding() {
  const navigate = useNavigate();
  const { user, hasProfile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Agency info
  const [form, setForm] = useState({
    agencyName: '', contactName: '', contactEmail: user?.email || '',
    agencyType: '', serviceArea: '', bio: '', websiteUrl: '', specialties: [],
  });

  // Step 2: Roster
  const [roster, setRoster] = useState([]);
  const [creatorForm, setCreatorForm] = useState({ ...EMPTY_CREATOR });
  const [showCreatorForm, setShowCreatorForm] = useState(true);

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'AGENCY') return <Navigate to="/" replace />;
  if (hasProfile) return <Navigate to="/agency/dashboard" replace />;

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateCreatorForm = (field, value) => setCreatorForm((prev) => ({ ...prev, [field]: value }));

  const toggleSpecialty = (s) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }));
  };

  const toggleStyleTag = (tag) => {
    setCreatorForm((prev) => ({
      ...prev,
      contentStyleTags: prev.contentStyleTags.includes(tag)
        ? prev.contentStyleTags.filter((x) => x !== tag)
        : [...prev.contentStyleTags, tag],
    }));
  };

  const addCreatorToRoster = () => {
    if (!creatorForm.name || !creatorForm.handle) return;
    setRoster((prev) => [...prev, { ...creatorForm, _tempId: Date.now() }]);
    setCreatorForm({ ...EMPTY_CREATOR });
    setShowCreatorForm(false);
  };

  const removeFromRoster = (tempId) => {
    setRoster((prev) => prev.filter((c) => c._tempId !== tempId));
  };

  const canProceedStep1 = form.agencyName && form.contactName && form.contactEmail && form.agencyType;
  const canFinish = roster.length > 0;

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      await createAgencyProfile(form);

      // Add each roster creator
      for (const creator of roster) {
        const { _tempId, ...data } = creator;
        await addRosterCreator({
          ...data,
          followerCount: data.followerCount ? parseInt(data.followerCount) : null,
          engagementRate: data.engagementRate ? parseFloat(data.engagementRate) : null,
        });
      }

      await refreshProfile();
      navigate('/agency/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {['Agency Info', 'Build Roster'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= i ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium ${step >= i ? 'text-dark' : 'text-muted'}`}>
                {label}
              </span>
              {i < 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Step 1: Agency Info */}
        {step === 0 && (
          <div className="card">
            <h1 className="font-display text-2xl font-bold text-dark mb-1">Set up your agency</h1>
            <p className="text-muted text-sm mb-6">Tell brands about your agency and what you specialize in.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Agency Name *</label>
                <input
                  type="text"
                  value={form.agencyName}
                  onChange={(e) => updateForm('agencyName', e.target.value)}
                  placeholder="e.g. North Shore Creators"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Contact Name *</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => updateForm('contactName', e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Contact Email *</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => updateForm('contactEmail', e.target.value)}
                    placeholder="email@agency.com"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Agency Type *</label>
                <div className="flex flex-wrap gap-2">
                  {AGENCY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateForm('agencyType', type)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        form.agencyType === type
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-mid border-border hover:border-purple-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Service Area</label>
                <input
                  type="text"
                  value={form.serviceArea}
                  onChange={(e) => updateForm('serviceArea', e.target.value)}
                  placeholder="e.g. Chicago North Shore"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  placeholder="Tell brands what makes your agency special..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Website</label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => updateForm('websiteUrl', e.target.value)}
                  placeholder="https://youragency.com"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        form.specialties.includes(s)
                          ? 'bg-purple-100 text-purple-700 border-purple-300'
                          : 'bg-white text-mid border-border hover:border-purple-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Btn
                onClick={() => setStep(1)}
                disabled={!canProceedStep1}
                className="!bg-purple-600 hover:!bg-purple-700"
              >
                Continue
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Btn>
            </div>
          </div>
        )}

        {/* Step 2: Build Roster */}
        {step === 1 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-dark mb-1">Build your roster</h1>
                <p className="text-muted text-sm">Add the creators you manage. You need at least 1 to continue.</p>
              </div>
              <button onClick={() => setStep(0)} className="text-sm text-muted hover:text-dark">
                Back
              </button>
            </div>

            {/* Existing roster cards */}
            {roster.length > 0 && (
              <div className="space-y-3 mb-6">
                {roster.map((c) => (
                  <div key={c._tempId} className="card flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-dark text-sm">{c.name}</p>
                      <p className="text-xs text-muted">@{c.handle} · {c.platform} · {c.followerCount ? `${(c.followerCount / 1000).toFixed(1)}K` : 'N/A'}</p>
                      {c.contentStyleTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.contentStyleTags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-600 border border-purple-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromRoster(c._tempId)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Creator Form */}
            {showCreatorForm ? (
              <div className="card">
                <h3 className="font-display text-lg font-semibold text-dark mb-4">
                  {roster.length === 0 ? 'Add your first creator' : 'Add another creator'}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Name *</label>
                      <input
                        type="text"
                        value={creatorForm.name}
                        onChange={(e) => updateCreatorForm('name', e.target.value)}
                        placeholder="Creator name"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Handle *</label>
                      <input
                        type="text"
                        value={creatorForm.handle}
                        onChange={(e) => updateCreatorForm('handle', e.target.value)}
                        placeholder="@handle"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Platform</label>
                      <select
                        value={creatorForm.platform}
                        onChange={(e) => updateCreatorForm('platform', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                      >
                        {PLATFORM_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Followers</label>
                      <input
                        type="number"
                        value={creatorForm.followerCount}
                        onChange={(e) => updateCreatorForm('followerCount', e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Eng. Rate %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={creatorForm.engagementRate}
                        onChange={(e) => updateCreatorForm('engagementRate', e.target.value)}
                        placeholder="e.g. 5.4"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Email</label>
                    <input
                      type="email"
                      value={creatorForm.contactEmail}
                      onChange={(e) => updateCreatorForm('contactEmail', e.target.value)}
                      placeholder="creator@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Content Style</label>
                    <div className="flex flex-wrap gap-2">
                      {STYLE_TAG_OPTIONS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleStyleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            creatorForm.contentStyleTags.includes(tag)
                              ? 'bg-purple-100 text-purple-700 border-purple-300'
                              : 'bg-white text-mid border-border hover:border-purple-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    {roster.length > 0 && (
                      <Btn variant="ghost" onClick={() => setShowCreatorForm(false)}>Cancel</Btn>
                    )}
                    <Btn
                      onClick={addCreatorToRoster}
                      disabled={!creatorForm.name || !creatorForm.handle}
                      className="!bg-purple-600 hover:!bg-purple-700"
                    >
                      Add to Roster
                    </Btn>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setCreatorForm({ ...EMPTY_CREATOR }); setShowCreatorForm(true); }}
                className="w-full py-4 border-2 border-dashed border-purple-200 rounded-xl text-purple-600 font-medium text-sm hover:bg-purple-50 transition-colors"
              >
                + Add Another Creator
              </button>
            )}

            <div className="flex justify-between mt-8">
              <Btn variant="ghost" onClick={() => setStep(0)}>Back</Btn>
              <Btn
                onClick={handleFinish}
                disabled={!canFinish}
                loading={saving}
                className="!bg-purple-600 hover:!bg-purple-700"
              >
                Launch Agency
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
