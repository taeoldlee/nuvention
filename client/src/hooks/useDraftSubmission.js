import { useState } from 'react';
import { submitDraft, uploadImages } from '../api';

export default function useDraftSubmission(projectId, onSuccess) {
  const [draftFiles, setDraftFiles] = useState([]);
  const [draftPreviews, setDraftPreviews] = useState([]);
  const [draftNotes, setDraftNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const combined = [...draftFiles, ...newFiles].slice(0, 10);
    setDraftFiles(combined);
    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    draftPreviews.forEach((url) => URL.revokeObjectURL(url));
    setDraftPreviews(newPreviews);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(draftPreviews[index]);
    setDraftFiles((prev) => prev.filter((_, i) => i !== index));
    setDraftPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (draftFiles.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      draftFiles.forEach((file) => formData.append('images', file));
      const uploadRes = await uploadImages(formData);
      const fileUrls = (uploadRes.data.images || []).map((img) => img.url);
      await submitDraft(projectId, { fileUrls, notes: draftNotes.trim() || undefined });
      setSubmitSuccess(true);
      setDraftFiles([]);
      draftPreviews.forEach((url) => URL.revokeObjectURL(url));
      setDraftPreviews([]);
      setDraftNotes('');
      if (onSuccess) await onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit draft. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    draftFiles, draftPreviews, draftNotes, setDraftNotes,
    submitting, submitSuccess, error,
    handleFilesSelected, removeFile, handleSubmit,
  };
}
