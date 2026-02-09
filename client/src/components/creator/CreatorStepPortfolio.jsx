export default function CreatorStepPortfolio({ formActions }) {
  const { fileInputRef, previews, handleFilesSelected, removeFile } = formActions;

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) handleFilesSelected(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">Show us your best work</h2>
        <p className="font-body text-muted text-sm">Upload 2-6 videos or images that represent your style. Reels, TikToks, and short clips work best.</p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-creator/30 rounded-2xl p-10 text-center cursor-pointer hover:border-creator/60 hover:bg-creatorLight/30 transition-all duration-200"
      >
        <input ref={fileInputRef} type="file" accept="video/*,image/*" multiple onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
        <div className="w-14 h-14 rounded-2xl bg-creatorLight mx-auto mb-4 flex items-center justify-center">
          <svg className="w-7 h-7 text-creator" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <p className="font-body font-semibold text-dark mb-1">Drag videos or images here, or click to browse</p>
        <p className="font-body text-sm text-muted">MP4, MOV, JPG, PNG. Up to 6 files (videos up to 100MB, images up to 10MB).</p>
      </div>

      {previews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-mid">
              {previews.length} of 6 files
              {previews.length < 2 && <span className="text-orange-600 ml-2 font-normal">(minimum 2 required)</span>}
            </p>
            {previews.length >= 2 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Looks great
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {previews.map((preview, i) => {
              const isVideo = typeof preview === 'object' ? preview.type?.startsWith('video/') : false;
              const src = typeof preview === 'object' ? preview.url : preview;
              return (
                <div key={`preview-${i}`} className="relative aspect-square rounded-xl overflow-hidden group bg-black">
                  {isVideo ? (
                    <video src={src} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={src} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                  )}
                  {isVideo && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                      VIDEO
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 bg-creatorLight/50 rounded-xl p-4">
        <svg className="w-5 h-5 text-creator mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <p className="font-body text-sm text-creator">Your portfolio is only shared with brands after you accept a brief.</p>
      </div>
    </div>
  );
}
