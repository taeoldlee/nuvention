import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, isOperator, isCreator, hasProfile } = useAuth();

  const handleOperatorClick = () => {
    if (user && isOperator && hasProfile) {
      navigate('/operator/dashboard');
    } else {
      navigate('/operator/onboarding');
    }
  };

  const handleCreatorClick = () => {
    if (user && isCreator && hasProfile) {
      navigate('/creator/dashboard');
    } else {
      navigate('/creator/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-bgWarm flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Logo & Tagline */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-display text-2xl font-bold text-dark tracking-tight">Locale</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-dark mb-4 leading-tight">
            Fresh content for<br />your feed
          </h1>
          <p className="font-body text-lg text-muted max-w-lg mx-auto leading-relaxed">
            We match neighborhood businesses with local creators who already know
            the vibe. Great content, no guesswork.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full mb-16">
          {/* Business Card */}
          <button
            onClick={handleOperatorClick}
            className="group card text-left hover:shadow-md hover:border-accent/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-accentLight flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v4.1" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-dark mb-2">
              I'm a Business
            </h3>
            <p className="font-body text-sm text-muted mb-4 leading-relaxed">
              Get matched with creators who understand your neighborhood and brand.
              Receive curated content options in minutes.
            </p>
            <div className="flex items-center text-accent font-semibold text-sm group-hover:gap-2 transition-all duration-300">
              <span>{user && isOperator && hasProfile ? 'Go to Dashboard' : 'Get Started'}</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>

          {/* Creator Card */}
          <button
            onClick={handleCreatorClick}
            className="group card text-left hover:shadow-md hover:border-creatorAccent/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-creatorLight flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-creator" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-dark mb-2">
              I'm a Creator
            </h3>
            <p className="font-body text-sm text-muted mb-4 leading-relaxed">
              Get paid to shoot the spots you already love. We send you briefs
              matched to your style and neighborhood.
            </p>
            <div className="flex items-center text-creatorAccent font-semibold text-sm group-hover:gap-2 transition-all duration-300">
              <span>{user && isCreator && hasProfile ? 'Go to Dashboard' : 'Get Started'}</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 text-sm text-muted font-body">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>3 curated options</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>&lt;2 min setup</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>100% usage rights</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted font-body">
          Locale &mdash; connecting neighborhood businesses with local creators
        </p>
      </footer>
    </div>
  );
}
