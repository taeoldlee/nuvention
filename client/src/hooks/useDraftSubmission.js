import { useState, useEffect, useRef } from 'react';
import { submitDraft, uploadImages } from '../api';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export default function useDraftSubmission(projectId, onSuccess) {
  const [draftFiles, setDraftFiles] = useState([]);
  const [draftPreviews, setDraftPreviews] = useState([]);
  const [draftNotes, setDraftNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const previewsRef = useRef(draftPreviews);
  previewsRef.current = draftPreviews;

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p.url || p));
    };
  }, []);

  const handleFilesSelected = (files) => {
    const allowed = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    const combined = [...draftFiles, ...allowed].slice(0, 10);
    setDraftFiles(combined);

    const newPreviews = combined.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));
    draftPreviews.forEach((p) => URL.revokeObjectURL(p.url || p));
    setDraftPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const preview = draftPreviews[index];
    URL.revokeObjectURL(preview?.url || preview);
    setDraftFiles((prev) => prev.filter((_, i) => i !== index));
    setDraftPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (draftFiles.length === 0) return;
    setSubmitting(true);
    setError(null);
    setUploadProgress(0);
    try {
      // Validate file sizes
      for (const file of draftFiles) {
        const limit = file.type.startsWith('video/') ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        const limitLabel = file.type.startsWith('video/') ? '100MB' : '10MB';
        if (file.size > limit) {
          throw new Error(`"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${limitLabel}.`);
        }
      }

      const formData = new FormData();
      draftFiles.forEach((file) => formData.append('images', file));
      const uploadRes = await uploadImages(formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      const fileUrls = (uploadRes.data.images || []).map((img) => img.url);
      await submitDraft(projectId, { fileUrls, notes: draftNotes.trim() || undefined });
      setSubmitSuccess(true);
      setDraftFiles([]);
      draftPreviews.forEach((p) => URL.revokeObjectURL(p.url || p));
      setDraftPreviews([]);
      setDraftNotes('');
      setUploadProgress(100);
      if (onSuccess) await onSuccess();
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Upload timed out. Try smaller files or check your connection.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to submit draft. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    draftFiles, draftPreviews, draftNotes, setDraftNotes,
    submitting, uploadProgress, submitSuccess, error,
    handleFilesSelected, removeFile, handleSubmit,
  };
}
