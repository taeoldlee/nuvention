import { useRef } from 'react';
import Btn from '../common/Btn';

export default function DraftUploadSection({ draftActions, isRevisionRequested }) {
  const {
    draftFiles, draftPreviews, draftNotes, setDraftNotes,
    submitting, uploadProgress, submitSuccess, error,
    handleFilesSelected, removeFile, handleSubmit,
  } = draftActions;

  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) handleFilesSelected(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const imageCount = draftPreviews.filter((p) => p.type?.startsWith('image/')).length;
  const videoCount = draftPreviews.filter((p) => p.type?.startsWith('video/')).length;
  const fileSummary = [
    imageCount > 0 && `${imageCount} image${imageCount !== 1 ? 's' : ''}`,
    videoCount > 0 && `${videoCount} video${videoCount !== 1 ? 's' : ''}`,
  ].filter(Boolean).join(', ');

  return (
    <div className="card mb-6">
      <h2 className="font-display text-lg font-bold text-dark mb-4">
        {isRevisionRequested ? 'Submit Revision' : 'Submit Your Draft'}
      </h2>
      <p className="font-body text-sm text-muted mb-5">
        {isRevisionRequested
          ? 'Upload your revised content based on the feedback above.'
          : 'Upload your content and add any notes for the brand.'}
      </p>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-creator/30 rounded-2xl p-5 sm:p-8 text-center cursor-pointer hover:border-creator/60 hover:bg-creatorLight/30 transition-all duration-200 mb-5"
      >
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
        <div className="w-12 h-12 rounded-xl bg-creatorLight mx-auto mb-3 flex items-center justify-center">
          <svg className="w-6 h-6 text-creator" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="font-body font-semibold text-dark mb-1">Drag files here or click to browse</p>
        <p className="font-body text-sm text-muted">JPG, PNG, WebP, MP4, MOV (videos up to 100MB)</p>
      </div>

      {draftPreviews.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-mid mb-3">
            {fileSummary} selected
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {draftPreviews.map((preview, i) => (
              <div key={`preview-${i}`} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100">
                {preview.type?.startsWith('video/') ? (
                  <video src={preview.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={preview.url} alt={`Draft ${i + 1}`} className="w-full h-full object-cover" />
                )}
                {preview.type?.startsWith('video/') && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    VIDEO
                  </div>
                )}
                <button
                  type="button"
                  aria-label={`Remove file ${i + 1}`}
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {submitting && uploadProgress < 100 && (
        <div className="mb-5 bg-creatorLight/50 rounded-xl p-4">
          <p className="text-sm font-medium text-creator mb-2">Uploading... {uploadProgress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-creator h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <div className="mb-5">
        <label className="label">Notes (optional)</label>
        <textarea value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} placeholder="Any context for the brand about your creative choices..." rows={3} className="input input-creator resize-none" />
      </div>

      {submitSuccess && (
        <div className="bg-greenBg border border-green/20 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green">Draft submitted successfully!</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-red-700 font-body">{error}</p>
        </div>
      )}

      <Btn creator size="lg" className="w-full" onClick={handleSubmit} loading={submitting} disabled={draftFiles.length === 0}>
        {isRevisionRequested ? 'Submit Revision' : 'Submit Draft'}
      </Btn>
    </div>
  );
}
