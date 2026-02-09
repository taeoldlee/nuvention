import { useNavigate } from 'react-router-dom';
import Btn from '../common/Btn';

const HOW_IT_WORKS = [
  { label: 'Matched by style', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
  { label: 'Briefs arrive', icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75' },
  { label: 'Accept or decline', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Submit & get paid', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' },
];

export default function CreatorStepDone() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-creatorLight mx-auto mb-6 flex items-center justify-center">
        <svg className="w-10 h-10 text-creatorAccent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h2 className="font-display text-3xl font-bold text-dark mb-3">You're In</h2>
      <p className="font-body text-muted max-w-md mx-auto mb-10">Welcome to Mise. Here's how it works from here.</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-2xl mx-auto mb-10">
        {HOW_IT_WORKS.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-creatorLight flex items-center justify-center text-creator mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <p className="font-body text-sm font-medium text-dark">{item.label}</p>
          </div>
        ))}
      </div>

      <Btn creator onClick={() => navigate('/creator/dashboard')} size="lg">Go to Dashboard</Btn>
    </div>
  );
}
