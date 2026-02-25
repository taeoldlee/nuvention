import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createBrief } from '../../api';
import Btn from '../../components/common/Btn';
import FadeIn from '../../components/marketing/FadeIn';
import AISuggestionCards from '../../components/operator/AISuggestionCards';

const CAMPAIGN_GOALS = [
  { value: 'EVENT_PROMO', label: 'Event Promo' },
  { value: 'MENU_LAUNCH', label: 'Menu Launch' },
  { value: 'SEASONAL_SPECIAL', label: 'Seasonal Special' },
  { value: 'GENERAL_CONTENT', label: 'General Content' },
  { value: 'GRAND_OPENING', label: 'Grand Opening' },
  { value: 'SLOW_PERIOD_FILL', label: 'Slow Period Fill' },
];

const CONTENT_TYPES = [
  { value: 'REEL', label: 'Reel' },
  { value: 'CAROUSEL', label: 'Carousel' },
  { value: 'STORY', label: 'Story' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'PHOTO_SET', label: 'Photo Set' },
  { value: 'BLOG_POST', label: 'Blog Post' },
];

const COMPENSATION_TYPES = [
  { value: 'FREE_PRODUCT', label: 'Free Product' },
  { value: 'FLAT_FEE', label: 'Flat Fee' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'COMMISSION', label: 'Commission' },
];

const USAGE_RIGHTS = [
  { value: 'ORGANIC_SOCIAL', label: 'Organic Social' },
  { value: 'PAID_ADS', label: 'Paid Ads' },
  { value: 'IN_STORE', label: 'In-Store' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'ALL', label: 'All' },
];

const LOCATION_REQUIREMENTS = [
  { value: 'IN_PERSON', label: 'In Person' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';

const selectClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none';

const labelClass = 'block text-sm font-medium text-dark mb-1.5 font-body';

export default function CreateBrief() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    campaignGoal: '',
    contentTypes: [],
    numberOfDeliverables: 1,
    creativeDirection: '',
    dos: '',
    donts: '',
    deadline: '',
    compensationType: '',
    compensationAmount: '',
    usageRights: '',
    locationRequirement: '',
    additionalNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { addToast } = useToast();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSuggestionApply = (field, value) => updateField(field, value);

  const toggleContentType = (type) => {
    setForm((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter((t) => t !== type)
        : [...prev.contentTypes, type],
    }));
    setError('');
  };

  const needsAmount =
    form.compensationType === 'FLAT_FEE' || form.compensationType === 'HYBRID';

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.campaignGoal) return 'Campaign goal is required.';
    if (form.contentTypes.length === 0) return 'Select at least one content type.';
    if (!form.numberOfDeliverables || form.numberOfDeliverables < 1)
      return 'Number of deliverables must be at least 1.';
    if (!form.creativeDirection.trim()) return 'Creative direction is required.';
    if (!form.compensationType) return 'Compensation type is required.';
    if (needsAmount && (!form.compensationAmount || Number(form.compensationAmount) <= 0))
      return 'Compensation amount is required for this payment type.';
    if (!form.usageRights) return 'Usage rights selection is required.';
    if (!form.locationRequirement) return 'Location requirement is required.';
    return null;
  };

  const validateFields = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (!form.campaignGoal) errors.campaignGoal = 'Select a campaign goal.';
    if (form.contentTypes.length === 0) errors.contentTypes = 'Select at least one content type.';
    if (!form.creativeDirection.trim()) errors.creativeDirection = 'Creative direction is required.';
    if (!form.compensationType) errors.compensationType = 'Select a compensation type.';
    if (needsAmount && (!form.compensationAmount || Number(form.compensationAmount) <= 0))
      errors.compensationAmount = 'Enter the compensation amount.';
    if (!form.usageRights) errors.usageRights = 'Select usage rights.';
    if (!form.locationRequirement) errors.locationRequirement = 'Select a location requirement.';
    return errors;
  };

  const handleSubmit = async (status) => {
    const errors = validateFields();
    setFieldErrors(errors);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        campaignGoal: form.campaignGoal,
        contentTypes: form.contentTypes,
        numberOfDeliverables: Number(form.numberOfDeliverables),
        creativeDirection: form.creativeDirection.trim(),
        dos: form.dos.trim() || null,
        donts: form.donts.trim() || null,
        deadline: form.deadline || null,
        compensationType: form.compensationType,
        compensationAmount: needsAmount
          ? Math.round(Number(form.compensationAmount) * 100)
          : null,
        usageRights: form.usageRights,
        locationRequirement: form.locationRequirement,
        additionalNotes: form.additionalNotes.trim() || null,
        status,
      };

      await createBrief(payload);
      addToast(status === 'OPEN' ? 'Brief published successfully!' : 'Brief saved as draft.', 'success');
      navigate('/operator/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-dark mb-1">
                Create a Brief
              </h1>
              <p className="font-body text-muted text-sm">
                Describe the content you need and find the right creator.
              </p>
            </div>
            <Btn variant="ghost" onClick={() => navigate('/operator/dashboard')}>
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Dashboard
            </Btn>
          </div>
        </FadeIn>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        <FadeIn delay={0.1}>
          <div className="card space-y-6">
            {/* Title */}
            <div>
              <label className={labelClass}>
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Summer Menu Launch Reel"
                className={`${inputClass} ${fieldErrors.title ? 'border-red-400 focus:ring-red-200' : ''}`}
              />
              {fieldErrors.title && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.title}</p>}
            </div>

            {/* Campaign Goal */}
            <div>
              <label className={labelClass}>
                Campaign Goal <span className="text-red-400">*</span>
              </label>
              <select
                value={form.campaignGoal}
                onChange={(e) => updateField('campaignGoal', e.target.value)}
                className={`${selectClass} ${fieldErrors.campaignGoal ? 'border-red-400 focus:ring-red-200' : ''}`}
              >
                <option value="">Select a goal...</option>
                {CAMPAIGN_GOALS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              {fieldErrors.campaignGoal && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.campaignGoal}</p>}
              {/* AI Suggestion Cards — appears when campaign goal is selected */}
              <AISuggestionCards
                campaignGoal={form.campaignGoal}
                contentTypes={form.contentTypes}
                onApply={handleSuggestionApply}
              />
            </div>

            {/* Content Types */}
            <div>
              <label className={labelClass}>
                Content Types <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-muted font-body mb-2">
                Select all that apply.
              </p>
              {fieldErrors.contentTypes && <p className="mb-2 text-xs text-red-600 font-body">{fieldErrors.contentTypes}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <label
                    key={ct.value}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm font-body ${
                      form.contentTypes.includes(ct.value)
                        ? 'border-accent bg-accent/5 text-dark'
                        : 'border-border bg-white text-mid hover:border-accent/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.contentTypes.includes(ct.value)}
                      onChange={() => toggleContentType(ct.value)}
                      className="accent-accent w-4 h-4"
                    />
                    {ct.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Number of Deliverables */}
            <div>
              <label className={labelClass}>
                Number of Deliverables <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.numberOfDeliverables}
                onChange={(e) =>
                  updateField('numberOfDeliverables', e.target.value)
                }
                className={inputClass}
              />
            </div>

            {/* Creative Direction */}
            <div>
              <label className={labelClass}>
                Creative Direction <span className="text-red-400">*</span>
                <span className="float-right text-xs font-normal text-muted">{form.creativeDirection.length}/500</span>
              </label>
              <textarea
                value={form.creativeDirection}
                onChange={(e) => updateField('creativeDirection', e.target.value)}
                placeholder="Describe the look, feel, and story you want the content to tell..."
                rows={4}
                maxLength={500}
                className={`${inputClass} resize-none ${fieldErrors.creativeDirection ? 'border-red-400' : ''}`}
              />
              {fieldErrors.creativeDirection && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.creativeDirection}</p>}
            </div>

            {/* Dos */}
            <div>
              <label className={labelClass}>
                Do's <span className="text-muted font-normal">(optional)</span>
              </label>
              <textarea
                value={form.dos}
                onChange={(e) => updateField('dos', e.target.value)}
                placeholder="e.g. Show the patio, mention happy hour, tag us..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Donts */}
            <div>
              <label className={labelClass}>
                Don'ts <span className="text-muted font-normal">(optional)</span>
              </label>
              <textarea
                value={form.donts}
                onChange={(e) => updateField('donts', e.target.value)}
                placeholder="e.g. No competitor logos, don't film the kitchen..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Deadline */}
            <div>
              <label className={labelClass}>
                Deadline <span className="text-muted font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Compensation Type */}
            <div>
              <label className={labelClass}>
                Compensation Type <span className="text-red-400">*</span>
              </label>
              <select
                value={form.compensationType}
                onChange={(e) => updateField('compensationType', e.target.value)}
                className={selectClass}
              >
                <option value="">Select compensation...</option>
                {COMPENSATION_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Compensation Amount (conditional) */}
            {needsAmount && (
              <div>
                <label className={labelClass}>
                  Compensation Amount ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.compensationAmount}
                  onChange={(e) =>
                    updateField('compensationAmount', e.target.value)
                  }
                  placeholder="e.g. 150"
                  className={inputClass}
                />
                <p className="text-xs text-muted font-body mt-1">
                  Enter the dollar amount. This will be stored as cents on the backend.
                </p>
              </div>
            )}

            {/* Usage Rights */}
            <div>
              <label className={labelClass}>
                Usage Rights <span className="text-red-400">*</span>
              </label>
              <select
                value={form.usageRights}
                onChange={(e) => updateField('usageRights', e.target.value)}
                className={selectClass}
              >
                <option value="">Select usage rights...</option>
                {USAGE_RIGHTS.map((ur) => (
                  <option key={ur.value} value={ur.value}>
                    {ur.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Requirement */}
            <div>
              <label className={labelClass}>
                Location Requirement <span className="text-red-400">*</span>
              </label>
              <select
                value={form.locationRequirement}
                onChange={(e) =>
                  updateField('locationRequirement', e.target.value)
                }
                className={selectClass}
              >
                <option value="">Select location requirement...</option>
                {LOCATION_REQUIREMENTS.map((lr) => (
                  <option key={lr.value} value={lr.value}>
                    {lr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label className={labelClass}>
                Additional Notes{' '}
                <span className="text-muted font-normal">(optional)</span>
              </label>
              <textarea
                value={form.additionalNotes}
                onChange={(e) => updateField('additionalNotes', e.target.value)}
                placeholder="Anything else the creator should know..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Btn
                variant="secondary"
                onClick={() => handleSubmit('DRAFT')}
                loading={submitting}
                disabled={submitting}
              >
                Save as Draft
              </Btn>
              <Btn
                onClick={() => handleSubmit('OPEN')}
                loading={submitting}
                disabled={submitting}
              >
                Publish Brief
              </Btn>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
