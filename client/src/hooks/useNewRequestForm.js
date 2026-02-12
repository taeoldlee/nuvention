import { useEffect, useMemo, useState } from 'react';
import { createContentRequest } from '../api';
import { CONTENT_TYPES, formatCents, formatCompensation } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';

const CONTENT_GOALS = [
  'Menu item spotlight',
  'Atmosphere / ambiance',
  'Signature dish',
  'Neighborhood vibe',
  'Community moment',
];

function bestMatch(value, options) {
  if (!value) return null;
  const exact = options.find((o) => o === value);
  if (exact) return exact;
  const lower = value.toLowerCase();
  return options.find((o) => o.toLowerCase() === lower)
    || options.find((o) => lower.includes(o.toLowerCase()) || o.toLowerCase().includes(lower))
    || null;
}

function buildDeliverableString({ photos, reels, reelLength, stories }) {
  const parts = [];
  if (photos > 0) parts.push(`${photos} photo${photos !== 1 ? 's' : ''}`);
  if (reels > 0) parts.push(`${reels} Reel${reels !== 1 ? 's' : ''} (${reelLength}s)`);
  if (stories > 0) parts.push(`${stories} Stor${stories !== 1 ? 'ies' : 'y'}`);
  return parts.join(' + ') || '';
}

function parseDeliverableString(str) {
  const result = { photos: 0, reels: 0, reelLength: 15, stories: 0 };
  if (!str) return result;
  const photoMatch = str.match(/(\d+)\s*photo/i);
  const reelMatch = str.match(/(\d+)\s*reel/i);
  const lengthMatch = str.match(/\((\d+)s\)/i);
  const storyMatch = str.match(/(\d+)\s*stor/i);
  if (photoMatch) result.photos = parseInt(photoMatch[1], 10);
  if (reelMatch) result.reels = parseInt(reelMatch[1], 10);
  if (lengthMatch) result.reelLength = parseInt(lengthMatch[1], 10);
  if (storyMatch) result.stories = parseInt(storyMatch[1], 10);
  return result;
}

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
  const [photos, setPhotos] = useState(3);
  const [reels, setReels] = useState(1);
  const [reelLength, setReelLength] = useState(15);
  const [stories, setStories] = useState(0);
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

  const deliverableString = useMemo(
    () => buildDeliverableString({ photos, reels, reelLength, stories }),
    [photos, reels, reelLength, stories]
  );

  const hasDeliverables = photos > 0 || reels > 0 || stories > 0;

  const generatedBriefText = useMemo(() => {
    const lines = [
      `Goal: ${contentGoals.length > 0 ? contentGoals.join(', ') : 'Describe the specific goal'}`,
      `Subject: ${subject || 'What should be highlighted?'}`,
      `Creative direction: ${creativeDirection || 'Add any creative notes (lighting, mood, angles)'}`,
      `Deliverables: ${deliverableString || 'Configure deliverables'}`,
      `Timeline: ${timeline || 'Select timeline'}`,
      `Usage rights: ${usageRights || 'Usage rights will be generated'}`,
      `Compensation: ${formatCompensation(compensationType, compensationDetails)}`,
      `Content type: ${contentTypes.length > 0 ? contentTypes.join(', ') : 'Select content type'}`,
    ];
    return lines.join('\n');
  }, [contentTypes, contentGoals, subject, creativeDirection, deliverableString, timeline, usageRights, compensationType, compensationDetails]);

  const briefText = briefTouched ? briefTextOverride : generatedBriefText;

  const handleFindMatches = async () => {
    if (contentTypes.length === 0 || contentGoals.length === 0 || !hasDeliverables || !timeline) return;
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
        deliverables: deliverableString,
        timeline,
        usageRights,
        briefTemplate: {
          contentGoal: contentGoals.join(', '),
          subject,
          creativeDirection,
          deliverables: deliverableString,
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
    hasDeliverables &&
    timeline &&
    (compensationType !== 'FLAT_FEE' || (budgetMin > 0 && budgetMax >= budgetMin));

  const applySuggestion = (s) => {
    const ct = bestMatch(s.contentType, CONTENT_TYPES);
    const goal = bestMatch(s.contentGoal, CONTENT_GOALS);
    setContentTypes(ct ? [ct] : []);
    setContentGoals(goal ? [goal] : []);
    setSubject(s.subject || '');
    setCreativeDirection(s.creativeDirection || '');
    // Parse deliverables string into individual counts
    const parsed = parseDeliverableString(s.deliverables);
    setPhotos(parsed.photos);
    setReels(parsed.reels);
    setReelLength(parsed.reelLength);
    setStories(parsed.stories);
    setTimeline(TIMELINE_OPTIONS[0].value);
    setBriefTouched(false);
    addToast(`Applied: ${s.title}`, 'info');
  };

  return {
    contentTypes, setContentTypes,
    contentGoals, setContentGoals,
    subject, setSubject,
    creativeDirection, setCreativeDirection,
    photos, setPhotos,
    reels, setReels,
    reelLength, setReelLength,
    stories, setStories,
    deliverableString, hasDeliverables,
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
