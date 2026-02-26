import { useState, useEffect, useRef, useCallback } from 'react';
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

// Label maps for the preview step (matching portal BriefDetailView)
const CAMPAIGN_GOAL_LABELS = Object.fromEntries(CAMPAIGN_GOALS.map((g) => [g.value, g.label]));
const COMPENSATION_LABELS = Object.fromEntries(COMPENSATION_TYPES.map((c) => [c.value, c.label]));
const USAGE_RIGHTS_LABELS = { ORGANIC_SOCIAL: 'Organic Social', PAID_ADS: 'Paid Ads', IN_STORE: 'In-Store', WEBSITE: 'Website', ALL: 'All Rights' };
const LOCATION_LABELS = Object.fromEntries(LOCATION_REQUIREMENTS.map((l) => [l.value, l.label]));
const CONTENT_TYPE_LABELS = Object.fromEntries(CONTENT_TYPES.map((c) => [c.value, c.label]));

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';

const selectClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none';

const labelClass = 'block text-sm font-medium text-dark mb-1.5 font-body';

const STEP_LABELS = ['Basics', 'Creative Details', 'Review & Publish'];

const AUTO_SAVE_KEY = 'locale_brief_draft';
const AUTO_SAVE_DELAY = 1000;

// ─── Progress Stepper ───

function ProgressStepper({ currentStep, onStepClick }) {
  return (
    <div className="mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-300 ${
                    isCompleted || isActive ? 'bg-accent' : 'bg-border'
                  }`}
                  style={{ zIndex: 0 }}
                />
              )}

              {/* Circle */}
              <button
                type="button"
                onClick={() => onStepClick(stepNum)}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold font-body transition-all duration-300 ${
                  isCompleted
                    ? 'bg-accent text-white shadow-sm cursor-pointer hover:bg-accent/90'
                    : isActive
                      ? 'bg-accent text-white shadow-md ring-4 ring-accent/20 cursor-default'
                      : 'bg-white border-2 border-border text-muted cursor-pointer hover:border-accent/40'
                }`}
                aria-label={`Step ${stepNum}: ${label}`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  stepNum
                )}
              </button>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-body font-medium transition-colors duration-300 ${
                  isActive ? 'text-accent' : isCompleted ? 'text-dark' : 'text-muted'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1: Basics ───

function StepBasics({ form, updateField, toggleContentType, fieldErrors, handleSuggestionApply }) {
  const needsAmount =
    form.compensationType === 'FLAT_FEE' || form.compensationType === 'HYBRID';

  return (
    <div className="space-y-6">
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
        {/* AI Suggestion Cards */}
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

      {/* Compensation Type */}
      <div>
        <label className={labelClass}>
          Compensation Type <span className="text-red-400">*</span>
        </label>
        <select
          value={form.compensationType}
          onChange={(e) => updateField('compensationType', e.target.value)}
          className={`${selectClass} ${fieldErrors.compensationType ? 'border-red-400 focus:ring-red-200' : ''}`}
        >
          <option value="">Select compensation...</option>
          {COMPENSATION_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
        {fieldErrors.compensationType && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.compensationType}</p>}
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
            className={`${inputClass} ${fieldErrors.compensationAmount ? 'border-red-400 focus:ring-red-200' : ''}`}
          />
          {fieldErrors.compensationAmount && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.compensationAmount}</p>}
          <p className="text-xs text-muted font-body mt-1">
            Enter the dollar amount. This will be stored as cents on the backend.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Creative Details ───

function StepCreativeDetails({ form, updateField, fieldErrors }) {
  return (
    <div className="space-y-6">
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

      {/* Usage Rights */}
      <div>
        <label className={labelClass}>
          Usage Rights <span className="text-red-400">*</span>
        </label>
        <select
          value={form.usageRights}
          onChange={(e) => updateField('usageRights', e.target.value)}
          className={`${selectClass} ${fieldErrors.usageRights ? 'border-red-400 focus:ring-red-200' : ''}`}
        >
          <option value="">Select usage rights...</option>
          {USAGE_RIGHTS.map((ur) => (
            <option key={ur.value} value={ur.value}>
              {ur.label}
            </option>
          ))}
        </select>
        {fieldErrors.usageRights && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.usageRights}</p>}
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
          className={`${selectClass} ${fieldErrors.locationRequirement ? 'border-red-400 focus:ring-red-200' : ''}`}
        >
          <option value="">Select location requirement...</option>
          {LOCATION_REQUIREMENTS.map((lr) => (
            <option key={lr.value} value={lr.value}>
              {lr.label}
            </option>
          ))}
        </select>
        {fieldErrors.locationRequirement && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.locationRequirement}</p>}
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
    </div>
  );
}

// ─── Step 3: Review & Publish (Portal-style preview) ───

function StepReviewPublish({ form, handleSubmit, submitting }) {
  const needsAmount =
    form.compensationType === 'FLAT_FEE' || form.compensationType === 'HYBRID';
  const contentTypes = Array.isArray(form.contentTypes) ? form.contentTypes : [];

  function formatDeadline(dateStr) {
    if (!dateStr) return 'Flexible';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatCompensation() {
    const type = COMPENSATION_LABELS[form.compensationType] || form.compensationType || '--';
    if (needsAmount && form.compensationAmount && Number(form.compensationAmount) > 0) {
      return `${type} -- $${Number(form.compensationAmount).toFixed(0)}`;
    }
    return type;
  }

  return (
    <div className="space-y-6">
      {/* Preview header */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <p className="text-xs font-semibold text-accent font-body uppercase tracking-wide">
          Preview -- How creators will see your brief
        </p>
      </div>

      {/* Portal-style brief card */}
      <div className="card">
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-dark">
            {form.title || 'Untitled Brief'}
          </h2>
        </div>

        {/* Content Types */}
        {contentTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {contentTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
              >
                {CONTENT_TYPE_LABELS[type] || type.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Details Grid -- matches portal BriefDetailView */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Compensation</p>
            <p className="text-sm font-semibold text-dark font-body">{formatCompensation()}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Deadline</p>
            <p className="text-sm font-semibold text-dark font-body">{formatDeadline(form.deadline)}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Deliverables</p>
            <p className="text-sm font-semibold text-dark font-body">{form.numberOfDeliverables || '--'}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Campaign Goal</p>
            <p className="text-sm font-semibold text-dark font-body">
              {CAMPAIGN_GOAL_LABELS[form.campaignGoal] || form.campaignGoal || '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Usage Rights</p>
            <p className="text-sm font-semibold text-dark font-body">
              {USAGE_RIGHTS_LABELS[form.usageRights] || form.usageRights || '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Location</p>
            <p className="text-sm font-semibold text-dark font-body">
              {LOCATION_LABELS[form.locationRequirement] || form.locationRequirement || '--'}
            </p>
          </div>
        </div>

        {/* Creative Direction */}
        {form.creativeDirection && (
          <div className="border-t border-border pt-4 mb-4">
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Creative Direction</p>
            <p className="text-sm text-dark font-body leading-relaxed">{form.creativeDirection}</p>
          </div>
        )}

        {/* Dos & Don'ts */}
        {(form.dos || form.donts) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {form.dos && (
              <div className="bg-greenBg/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green uppercase tracking-wide mb-1">Do's</p>
                <p className="text-sm text-dark font-body leading-relaxed">{form.dos}</p>
              </div>
            )}
            {form.donts && (
              <div className="bg-red-50/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Don'ts</p>
                <p className="text-sm text-dark font-body leading-relaxed">{form.donts}</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Notes */}
        {form.additionalNotes && (
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Additional Notes</p>
            <p className="text-sm text-dark font-body leading-relaxed">{form.additionalNotes}</p>
          </div>
        )}
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
  );
}

// ─── Main Component ───

export default function CreateBrief() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
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
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const { addToast } = useToast();

  const autoSaveTimerRef = useRef(null);
  const formInitializedRef = useRef(false);

  // ─── Restore from localStorage on mount ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.title !== undefined) {
          setForm(parsed);
          setAutoSaveStatus('Draft restored');
          setTimeout(() => setAutoSaveStatus(''), 3000);
        }
      }
    } catch {
      // Ignore parse errors
    }
    formInitializedRef.current = true;
  }, []);

  // ─── Auto-save to localStorage on form changes (debounced) ───
  useEffect(() => {
    if (!formInitializedRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(form));
        setAutoSaveStatus('Auto-saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch {
        // Ignore storage errors
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [form]);

  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
    } catch {
      // Ignore
    }
  }, []);

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

  // ─── Step-level validation ───

  const validateStep1 = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (!form.campaignGoal) errors.campaignGoal = 'Select a campaign goal.';
    if (form.contentTypes.length === 0) errors.contentTypes = 'Select at least one content type.';
    if (!form.compensationType) errors.compensationType = 'Select a compensation type.';
    if (needsAmount && (!form.compensationAmount || Number(form.compensationAmount) <= 0))
      errors.compensationAmount = 'Enter the compensation amount.';
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!form.creativeDirection.trim()) errors.creativeDirection = 'Creative direction is required.';
    if (!form.usageRights) errors.usageRights = 'Select usage rights.';
    if (!form.locationRequirement) errors.locationRequirement = 'Select a location requirement.';
    return errors;
  };

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

  // ─── Navigation ───

  const goToStep = (targetStep) => {
    // Allow going back freely
    if (targetStep < step) {
      setStep(targetStep);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate current step before going forward
    if (step === 1) {
      const errors = validateStep1();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Please complete all required fields before continuing.');
        return;
      }
    }
    if (step === 2 && targetStep > 2) {
      const errors = validateStep2();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Please complete all required fields before continuing.');
        return;
      }
    }

    setFieldErrors({});
    setError('');
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => goToStep(step + 1);
  const handleBack = () => goToStep(step - 1);

  // ─── Submit ───

  const handleSubmit = async (status) => {
    const errors = validateFields();
    setFieldErrors(errors);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      // Navigate to the step with the error
      const step1Errors = validateStep1();
      if (Object.keys(step1Errors).length > 0) {
        setStep(1);
        return;
      }
      const step2Errors = validateStep2();
      if (Object.keys(step2Errors).length > 0) {
        setStep(2);
        return;
      }
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
      clearAutoSave();
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
          <div className="flex items-center justify-between mb-6">
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

        {/* Progress Stepper */}
        <FadeIn delay={0.05}>
          <ProgressStepper currentStep={step} onStepClick={goToStep} />
        </FadeIn>

        {/* Auto-save status */}
        {autoSaveStatus && (
          <div className="flex items-center gap-1.5 mb-4 text-xs text-muted font-body">
            <svg className="w-3.5 h-3.5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {autoSaveStatus}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        <FadeIn delay={0.1}>
          <div className="card">
            {/* Step 1 */}
            {step === 1 && (
              <StepBasics
                form={form}
                updateField={updateField}
                toggleContentType={toggleContentType}
                fieldErrors={fieldErrors}
                handleSuggestionApply={handleSuggestionApply}
              />
            )}

            {/* Step 2 */}
            {step === 2 && (
              <StepCreativeDetails
                form={form}
                updateField={updateField}
                fieldErrors={fieldErrors}
              />
            )}

            {/* Step 3 */}
            {step === 3 && (
              <StepReviewPublish
                form={form}
                handleSubmit={handleSubmit}
                submitting={submitting}
              />
            )}

            {/* Navigation buttons (steps 1 & 2) */}
            {step < 3 && (
              <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
                {step > 1 ? (
                  <Btn variant="ghost" onClick={handleBack}>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back
                  </Btn>
                ) : (
                  <div />
                )}
                <Btn onClick={handleNext}>
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Btn>
              </div>
            )}

            {/* Back button on step 3 (above the card's action buttons) */}
            {step === 3 && (
              <div className="pt-4 mt-2">
                <Btn variant="ghost" onClick={handleBack}>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Creative Details
                </Btn>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
