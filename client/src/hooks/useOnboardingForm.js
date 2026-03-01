import { useState } from 'react';
import { NEIGHBORHOODS } from '../utils/constants';

const INITIAL_FORM = {
  businessName: '',
  neighborhood: '',
  customNeighborhood: '',
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
  visualRefUrls: [],
  cuisineTypes: [],
  budgetMin: 100,
  budgetMax: 500,
  contentNoGos: '',
  selectedGoal: null,
  customGoalText: '',
  preferredVideoStyle: '',
};

export default function useOnboardingForm() {
  const [form, setForm] = useState(INITIAL_FORM);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
  };

  const setSingleSelect = (field, item) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field] === item ? '' : item,
    }));
  };

  const applyImportData = (data) => {
    // Match neighborhood to predefined list, or use "Other" with custom value
    let neighborhood = prev => prev.neighborhood;
    if (data.neighborhood) {
      const match = NEIGHBORHOODS.find((n) => n.toLowerCase() === data.neighborhood.toLowerCase());
      if (match) {
        neighborhood = () => match;
      } else {
        // Not in predefined list — set to "Other" and store custom value
        neighborhood = () => 'Other';
      }
    }
    setForm((prev) => ({
      ...prev,
      businessName: data.businessName || prev.businessName,
      neighborhood: neighborhood(prev),
      customNeighborhood: (!NEIGHBORHOODS.find((n) => n.toLowerCase() === (data.neighborhood || '').toLowerCase()) && data.neighborhood) ? data.neighborhood : prev.customNeighborhood || '',
      vibes: (data.vibe?.length ? data.vibe : data.vibes) || prev.vibes,
      values: data.values?.length ? data.values : prev.values,
      contentComfortZones: data.contentComfortZones?.length
        ? data.contentComfortZones
        : prev.contentComfortZones,
      // Extended fields for AI-powered onboarding
      ...(data.vibeScales && { vibeScales: { ...prev.vibeScales, ...data.vibeScales } }),
      ...(data.guestExperienceKeywords?.length && { guestExperienceKeywords: data.guestExperienceKeywords }),
      ...(data.cuisineTypes?.length && { cuisineTypes: data.cuisineTypes }),
      ...(data.budgetMin != null && { budgetMin: data.budgetMin }),
      ...(data.budgetMax != null && { budgetMax: data.budgetMax }),
      ...(data.contentNoGos != null && { contentNoGos: data.contentNoGos }),
      ...(data.visualRefUrls?.length && { visualRefUrls: data.visualRefUrls }),
    }));
  };

  const effectiveNeighborhood = form.neighborhood === 'Other' ? form.customNeighborhood.trim() : form.neighborhood;

  const canProceedToGoal =
    form.businessName.trim() &&
    effectiveNeighborhood &&
    form.cuisineTypes.length > 0;

  const canSubmit =
    !!(form.selectedGoal || form.customGoalText.trim());

  return {
    form,
    updateForm,
    toggleArrayItem,
    setSingleSelect,
    applyImportData,
    effectiveNeighborhood,
    canProceedToGoal,
    canSubmit,
  };
}
