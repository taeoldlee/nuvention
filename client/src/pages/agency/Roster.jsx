import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAgencyRoster, addRosterCreator, updateRosterCreator, deleteRosterCreator } from '../../api';
import Btn from '../../components/common/Btn';
import EmptyState from '../../components/common/EmptyState';
import FadeIn from '../../components/marketing/FadeIn';

const PLATFORM_OPTIONS = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'REDNOTE', 'OTHER'];
const PLATFORM_LABELS = {
  INSTAGRAM: 'Instagram', TIKTOK: 'TikTok', YOUTUBE: 'YouTube', REDNOTE: 'RedNote', OTHER: 'Other',
};
const STYLE_TAG_OPTIONS = [
  'Clean', 'Minimalist', 'Editorial', 'Warm', 'Bold', 'Energetic',
  'Candid', 'Documentary', 'Lifestyle', 'Story-driven', 'Authentic', 'Community',
];

const EMPTY_FORM = {
  name: '', handle: '', platform: 'INSTAGRAM', followerCount: '',
  engagementRate: '', contactEmail: '', contentStyleTags: [], bio: '',
};

export default function AgencyRoster() {
  const navigate = useNavigate();
  const { user, isAgency, hasProfile } = useAuth();

  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasProfile) return;
    loadRoster();
  }, [hasProfile]);

  async function loadRoster() {
    setLoading(true);
    try {
      const res = await getAgencyRoster();
      setCreators(res.data.creators || []);
    } catch (err) {
      console.error('Roster load error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!user || !isAgency) return <Navigate to="/" replace />;
  if (!hasProfile) return <Navigate to="/agency/onboarding" replace />;

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleStyleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      contentStyleTags: prev.contentStyleTags.includes(tag)
        ? prev.contentStyleTags.filter((x) => x !== tag)
        : [...prev.contentStyleTags, tag],
    }));
  };

  const startAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const startEdit = (creator) => {
    setForm({
      name: creator.name,
      handle: creator.handle,
      platform: creator.platform,
      followerCount: creator.followerCount || '',
      engagementRate: creator.engagementRate || '',
      contactEmail: creator.contactEmail || '',
      contentStyleTags: Array.isArray(creator.contentStyleTags) ? creator.contentStyleTags : [],
      bio: creator.bio || '',
    });
    setEditingId(creator.id);
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.name || !form.handle) return;
    setSaving(true);
    setError('');
    try {
      const data = {
        ...form,
        followerCount: form.followerCount ? parseInt(form.followerCount) : null,
        engagementRate: form.engagementRate ? parseFloat(form.engagementRate) : null,
      };
      if (editingId) {
        await updateRosterCreator(editingId, data);
      } else {
        await addRosterCreator(data);
      }
      setShowForm(false);
      setEditingId(null);
      await loadRoster();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this creator from your roster?')) return;
    try {
      await deleteRosterCreator(id);
      await loadRoster();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark mb-1">Creator Roster</h1>
              <p className="text-muted text-sm font-body">Manage the creators you represent.</p>
            </div>
            <Btn onClick={startAdd} className="!bg-purple-600 hover:!bg-purple-700">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Creator
            </Btn>
          </div>
        </FadeIn>

        {/* Form */}
        {showForm && (
          <FadeIn>
            <div className="card mb-6">
              <h3 className="font-display text-lg font-semibold text-dark mb-4">
                {editingId ? 'Edit Creator' : 'Add Creator'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="Creator name"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Handle *</label>
                    <input
                      type="text"
                      value={form.handle}
                      onChange={(e) => updateForm('handle', e.target.value)}
                      placeholder="@handle"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Platform</label>
                    <select
                      value={form.platform}
                      onChange={(e) => updateForm('platform', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    >
                      {PLATFORM_OPTIONS.map((p) => (
                        <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Followers</label>
                    <input
                      type="number"
                      value={form.followerCount}
                      onChange={(e) => updateForm('followerCount', e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Eng. Rate %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.engagementRate}
                      onChange={(e) => updateForm('engagementRate', e.target.value)}
                      placeholder="e.g. 5.4"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => updateForm('contactEmail', e.target.value)}
                    placeholder="creator@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => updateForm('bio', e.target.value)}
                    rows={2}
                    placeholder="Brief description of this creator..."
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm resize-none"
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
                          form.contentStyleTags.includes(tag)
                            ? 'bg-purple-100 text-purple-700 border-purple-300'
                            : 'bg-white text-mid border-border hover:border-purple-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 border border-red-200">{error}</div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Btn variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Btn>
                  <Btn
                    onClick={handleSave}
                    disabled={!form.name || !form.handle}
                    loading={saving}
                    className="!bg-purple-600 hover:!bg-purple-700"
                  >
                    {editingId ? 'Save Changes' : 'Add to Roster'}
                  </Btn>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Roster List */}
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : creators.length === 0 && !showForm ? (
          <EmptyState
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
            title="No creators yet"
            description="Add creators to your roster to start applying to briefs on their behalf."
            action={
              <Btn onClick={startAdd} size="sm" className="!bg-purple-600 hover:!bg-purple-700">Add First Creator</Btn>
            }
          />
        ) : (
          <div className="space-y-3">
            {creators.map((creator) => (
              <FadeIn key={creator.id}>
                <div className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-body font-semibold text-dark">{creator.name}</h3>
                        <span className="text-xs text-muted bg-bgTan px-2 py-0.5 rounded-full border border-border">
                          {PLATFORM_LABELS[creator.platform] || creator.platform}
                        </span>
                      </div>
                      <p className="text-sm text-muted font-body mb-2">
                        @{creator.handle}
                        {creator.followerCount ? ` · ${(creator.followerCount / 1000).toFixed(1)}K followers` : ''}
                        {creator.engagementRate ? ` · ${creator.engagementRate}% ER` : ''}
                      </p>
                      {creator.bio && (
                        <p className="text-sm text-mid font-body mb-2">{creator.bio}</p>
                      )}
                      {creator.contentStyleTags && Array.isArray(creator.contentStyleTags) && creator.contentStyleTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {creator.contentStyleTags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-600 border border-purple-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(creator)}
                        className="p-2 rounded-lg text-muted hover:text-dark hover:bg-bgWarm transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(creator.id)}
                        className="p-2 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
