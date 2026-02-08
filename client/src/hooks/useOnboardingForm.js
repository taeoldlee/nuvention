import { useState } from 'react';
import { uploadImages } from '../api';

const INITIAL_FORM = {
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
  visualRefUrls: [],
  budgetMin: 100,
  budgetMax: 500,
  contentNoGos: '',
};

export default function useOnboardingForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [keywordInput, setKeywordInput] = useState('');
  const [visualRefUploading, setVisualRefUploading] = useState(false);
  const [visualRefError, setVisualRefError] = useState('');

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

  const updateVibeScale = (key, value) => {
    setForm((prev) => ({
      ...prev,
      vibeScales: { ...prev.vibeScales, [key]: value },
    }));
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
  };

  const removeKeyword = (keyword) => {
    setForm((prev) => ({
      ...prev,
      guestExperienceKeywords: prev.guestExperienceKeywords.filter((k) => k !== keyword),
    }));
  };

  const handleVisualRefsSelected = async (files) => {
    const selected = Array.from(files || []).slice(0, 5);
    if (selected.length === 0) return;
    setVisualRefUploading(true);
    setVisualRefError('');
    try {
      const formData = new FormData();
      selected.forEach((file) => formData.append('images', file));
      const res = await uploadImages(formData);
      const urls = (res.data.images || []).map((img) => img.url);
      setForm((prev) => {
        const merged = [...prev.visualRefUrls, ...urls].slice(0, 5);
        return { ...prev, visualRefUrls: merged };
      });
    } catch (err) {
      setVisualRefError(
        err.response?.data?.error || 'Could not upload references. Try again.'
      );
    } finally {
      setVisualRefUploading(false);
    }
  };

  const applyImportData = (data) => {
    setForm((prev) => ({
      ...prev,
      businessName: data.businessName || prev.businessName,
      neighborhood: data.neighborhood || prev.neighborhood,
      vibes: (data.vibe?.length ? data.vibe : data.vibes) || prev.vibes,
      values: data.values?.length ? data.values : prev.values,
      contentComfortZones: data.contentComfortZones?.length
        ? data.contentComfortZones
        : prev.contentComfortZones,
    }));
  };

  const canProceedFromStep1 =
    form.businessName.trim() &&
    form.neighborhood &&
    form.vibes.length > 0 &&
    form.values.length > 0 &&
    form.contentComfortZones.length > 0 &&
    form.guestExperienceKeywords.length > 0;

  const canProceedFromStep2 =
    form.budgetMin > 0 && form.budgetMax >= form.budgetMin;

  return {
    form,
    keywordInput,
    setKeywordInput,
    visualRefUploading,
    visualRefError,
    updateForm,
    toggleArrayItem,
    setSingleSelect,
    updateVibeScale,
    addKeyword,
    removeKeyword,
    handleVisualRefsSelected,
    applyImportData,
    canProceedFromStep1,
    canProceedFromStep2,
  };
}
