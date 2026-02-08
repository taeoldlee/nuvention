export default function CreatorStepProfile({ formActions }) {
  const { displayName, setDisplayName, bio, setBio, instagram, setInstagram, tiktok, setTiktok } = formActions;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-1">Tell us about yourself</h2>
        <p className="font-body text-muted text-sm">This helps brands get a feel for who you are.</p>
      </div>

      <div>
        <label className="label">Display Name *</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Maya Chen" className="input input-creator" />
      </div>

      <div>
        <label className="label">Bio *</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few words about what you love to shoot..." rows={3} maxLength={280} className="input input-creator resize-none" />
        <p className="text-xs text-muted mt-1 text-right">{bio.length}/280</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Instagram (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value.replace('@', ''))} placeholder="handle" className="input input-creator pl-8" />
          </div>
        </div>
        <div>
          <label className="label">TikTok (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
            <input type="text" value={tiktok} onChange={(e) => setTiktok(e.target.value.replace('@', ''))} placeholder="handle" className="input input-creator pl-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
