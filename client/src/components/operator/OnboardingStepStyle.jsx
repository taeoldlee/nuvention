import Btn from '../common/Btn';

const STYLE_OPTIONS = [
  {
    key: 'style_one',
    title: 'Warm & Inviting',
    description: 'Cozy lighting, earth tones, and intimate close-ups that make people feel at home.',
    gradient: 'from-rose-400 to-orange-300',
  },
  {
    key: 'style_two',
    title: 'Clean & Polished',
    description: 'Bright, minimal, and editorial — crisp shots that feel professional and curated.',
    gradient: 'from-blue-400 to-cyan-300',
  },
  {
    key: 'style_three',
    title: 'Bold & Energetic',
    description: 'Vibrant colors, dynamic angles, and high energy that grabs attention fast.',
    gradient: 'from-purple-400 to-pink-300',
  },
  {
    key: 'style_four',
    title: 'Organic & Candid',
    description: 'Natural, unscripted moments — real people, real reactions, documentary feel.',
    gradient: 'from-emerald-400 to-teal-300',
  },
];

const GOAL_TO_STYLE = {
  fill_slow_days: 'style_one',
  attract_new_faces: 'style_three',
  reach_different_crowd: 'style_three',
  launch_menu_item: 'style_two',
  hype_event: 'style_three',
  grow_social_media: 'style_three',
  get_quality_content: 'style_two',
  stand_out_competitors: 'style_four',
};

export default function OnboardingStepStyle({ formActions, saving, saveError, onSubmit, onBack }) {
  const { form, updateForm } = formActions;
  const selected = form.preferredVideoStyle;
  const goalKey = form.selectedGoal?.primary;
  const recommendedStyle = GOAL_TO_STYLE[goalKey] || null;

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-dark mb-2">
          Your visual style
        </h2>
        <p className="font-body text-sm text-muted">
          Pick the content style that fits your brand. This helps us match you with the right creators.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STYLE_OPTIONS.map((style) => {
          const isSelected = selected === style.key;
          const isRecommended = recommendedStyle === style.key;
          return (
            <button
              key={style.key}
              type="button"
              onClick={() => updateForm('preferredVideoStyle', style.key)}
              className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-accent ring-4 ring-accent/20 scale-[1.02]'
                  : 'border-transparent hover:border-accent/30 hover:shadow-md'
              }`}
            >
              {isRecommended && (
                <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-accent shadow-sm backdrop-blur-sm">
                  We recommend
                </span>
              )}
              <div className={`bg-gradient-to-br ${style.gradient} p-6 pb-4`}>
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  {isSelected ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-white/50" />
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  {style.title}
                </h3>
              </div>
              <div className="p-4 bg-white">
                <p className="font-body text-sm text-mid leading-relaxed">
                  {style.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {saveError && (
        <p className="text-sm text-red-600 font-body">{saveError}</p>
      )}

      <div className="pt-2 space-y-3">
        <Btn onClick={onSubmit} loading={saving} disabled={!selected} className="w-full" size="lg">
          Create Profile
        </Btn>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full text-sm text-muted hover:text-dark font-body underline underline-offset-2 transition-colors"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
