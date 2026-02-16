import Btn from '../common/Btn';
import LoadingSpinner from '../common/LoadingSpinner';

export default function CreatorStepImport({
  displayName, setDisplayName,
  instagram, setInstagram,
  tiktok, setTiktok,
  importing, importError,
  onImport, onSkipToManual,
}) {
  const canImport = displayName.trim() && (instagram.trim() || tiktok.trim());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">Quick import</h2>
        <p className="font-body text-muted text-sm">
          Enter your name and a social handle. We'll build your profile automatically.
        </p>
      </div>

      <div>
        <label className="label">Display Name *</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Maya Chen"
          className="input input-creator"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Instagram</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
              placeholder="handle"
              className="input input-creator pl-8"
            />
          </div>
        </div>
        <div>
          <label className="label">TikTok</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
            <input
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value.replace('@', ''))}
              placeholder="handle"
              className="input input-creator pl-8"
            />
          </div>
        </div>
      </div>

      {importError && (
        <p className="text-sm text-red-600 font-body">{importError}</p>
      )}

      {importing ? (
        <LoadingSpinner creator message="Importing your content and analyzing your style..." />
      ) : (
        <Btn creator onClick={onImport} disabled={!canImport} className="w-full">
          Import & Analyze
        </Btn>
      )}

      <div className="text-center pt-1">
        <button
          onClick={onSkipToManual}
          className="text-sm text-muted hover:text-dark font-body underline underline-offset-2 transition-colors"
        >
          Skip to manual setup
        </button>
      </div>
    </div>
  );
}
