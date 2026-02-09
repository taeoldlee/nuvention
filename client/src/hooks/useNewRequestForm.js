import { useEffect, useMemo, useState } from 'react';
import { createContentRequest } from '../api';
import { formatCents, formatCompensation } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';

const TIMELINE_OPTIONS = [
  { value: 'Standard (5-7 days)', label: 'Standard' },
  { value: 'Rush (2-3 days)', label: 'Rush' },
];

function buildUsageRights(timeline) {
  if (timeline?.toLowerCase().includes('rush')) {
    return 'Organic social + in-store, 6 months';
  }
  return 'Organic social + in-store, 12 months';
}

export default function useNewRequestForm() {
  const { addToast } = useToast();

  const [contentTypes, setContentTypes] = useState([]);
  const [contentGoals, setContentGoals] = useState([]);
  const [subject, setSubject] = useState('');
  const [creativeDirection, setCreativeDirection] = useState('');
  const [deliverables, setDeliverables] = useState([]);
  const [timeline, setTimeline] = useState(TIMELINE_OPTIONS[0].value);
  const [usageRights, setUsageRights] = useState(buildUsageRights(TIMELINE_OPTIONS[0].value));
  const [compensationType, setCompensationType] = useState('FLAT_FEE');
  const [budgetMin, setBudgetMin] = useState(150);
  const [budgetMax, setBudgetMax] = useState(300);
  const [compNotes, setCompNotes] = useState('');

  const [briefTouched, setBriefTouched] = useState(false);
  const [briefTextOverride, setBriefTextOverride] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState(null);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    setUsageRights(buildUsageRights(timeline));
  }, [timeline]);

  const compensationDetails = useMemo(() => ({
    minCents: budgetMin * 100,
    maxCents: budgetMax * 100,
    note: compNotes.trim() || undefined,
  }), [budgetMin, budgetMax, compNotes]);

  const generatedBriefText = useMemo(() => {
    const lines = [
      `Goal: ${contentGoals.length > 0 ? contentGoals.join(', ') : 'Describe the specific goal'}`,
      `Subject: ${subject || 'What should be highlighted?'}`,
      `Creative direction: ${creativeDirection || 'Add any creative notes (lighting, mood, angles)'}`,
      `Deliverables: ${deliverables.length > 0 ? deliverables.join(', ') : 'Select deliverables'}`,
      `Timeline: ${timeline || 'Select timeline'}`,
      `Usage rights: ${usageRights || 'Usage rights will be generated'}`,
      `Compensation: ${formatCompensation(compensationType, compensationDetails)}`,
      `Content type: ${contentTypes.length > 0 ? contentTypes.join(', ') : 'Select content type'}`,
    ];
    return lines.join('\n');
  }, [contentTypes, contentGoals, subject, creativeDirection, deliverables, timeline, usageRights, compensationType, compensationDetails]);

  const briefText = briefTouched ? briefTextOverride : generatedBriefText;

  const handleFindMatches = async () => {
    if (contentTypes.length === 0 || contentGoals.length === 0 || deliverables.length === 0 || !timeline) return;
    setLoading(true);
    setError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const contentType = contentTypes.join(', ');
      const res = await createContentRequest({
        contentType,
        description: briefText,
        briefText,
        contentGoal: contentGoals.join(', '),
        subject,
        creativeDirection,
        deliverables: deliverables.join(', '),
        timeline,
        usageRights,
        briefTemplate: {
          contentGoal: contentGoals.join(', '),
          subject,
          creativeDirection,
          deliverables: deliverables.join(', '),
          timeline,
          usageRights,
        },
        compensationType,
        compensationDetails,
        budgetRange: `${formatCents(budgetMin * 100)} - ${formatCents(budgetMax * 100)}`,
      });
      const request = res.data.request;
      setRequestId(request.id);
      setMatches(request.matches || []);
      addToast('Matches found!', 'success');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not find matches. Please try again.');
      addToast('Could not find matches.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    contentTypes.length > 0 &&
    contentGoals.length > 0 &&
    deliverables.length > 0 &&
    timeline &&
    (compensationType !== 'FLAT_FEE' || (budgetMin > 0 && budgetMax >= budgetMin));

  const applySuggestion = (s) => {
    setContentTypes(s.contentType ? [s.contentType] : []);
    setContentGoals(s.contentGoal ? [s.contentGoal] : []);
    setSubject(s.subject || '');
    setCreativeDirection(s.creativeDirection || '');
    setDeliverables(s.deliverables ? [s.deliverables] : []);
    addToast(`Applied: ${s.title}`, 'info');
  };

  return {
    contentTypes, setContentTypes,
    contentGoals, setContentGoals,
    subject, setSubject,
    creativeDirection, setCreativeDirection,
    deliverables, setDeliverables,
    timeline, setTimeline,
    usageRights,
    compensationType, setCompensationType,
    budgetMin, setBudgetMin,
    budgetMax, setBudgetMax,
    compNotes, setCompNotes,
    briefText, briefTouched, setBriefTouched, setBriefTextOverride,
    loading, error, matches, requestId,
    handleFindMatches, canSubmit, applySuggestion,
    resetMatches: () => { setMatches(null); setRequestId(null); },
    TIMELINE_OPTIONS,
  };
}
