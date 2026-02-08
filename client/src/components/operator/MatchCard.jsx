import { useNavigate } from 'react-router-dom';
import { formatCompensation } from '../../utils/constants';
import Btn from '../common/Btn';
import MatchSignals from '../common/MatchSignals';

export default function MatchCard({ match, idx, requestId, requestContext }) {
  const navigate = useNavigate();
  const { contentType, compensationType, budgetMin, budgetMax, compNotes } = requestContext;
  const hero = match.portfolioSamples?.[0]?.imageUrl || null;
  const thumbs = (match.portfolioSamples || []).slice(1, 3);

  return (
    <div className="card hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-accent/20 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
        <div className="w-full sm:w-24">
          <div className="w-full h-40 sm:w-24 sm:h-24 rounded-xl bg-bgTan border border-border overflow-hidden">
            {hero ? (
              <img src={hero} alt="UGC sample" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-xs">UGC sample</div>
            )}
          </div>
          {thumbs.length > 0 && (
            <div className="flex gap-1 mt-2">
              {thumbs.map((t, i) => (
                <div key={t.id || i} className="w-7 h-7 rounded-md overflow-hidden border border-border bg-bgTan">
                  <img src={t.imageUrl} alt="sample" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accentLight text-accent">
              {match.creatorAlias || `Creator ${String.fromCharCode(65 + idx)}`}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bgTan text-mid">
              {contentType}
            </span>
          </div>

          {(match.contentPreview || match.description) && (
            <p className="text-sm text-dark font-body mb-3 leading-relaxed">
              {match.contentPreview || match.description}
            </p>
          )}

          <MatchSignals signals={match.matchSignals} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {match.deliverables && (
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Deliverables</p>
                <p className="text-sm text-dark font-body font-medium">{match.deliverables}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Compensation</p>
              <p className="text-sm text-dark font-body font-medium">
                {formatCompensation(match.compensationType || compensationType, match.compensationDetails || {
                  minCents: budgetMin * 100,
                  maxCents: budgetMax * 100,
                  note: compNotes,
                })}
              </p>
            </div>
            {match.timeline && (
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Timeline</p>
                <p className="text-sm text-dark font-body font-medium">{match.timeline}</p>
              </div>
            )}
            {match.usageRights && (
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Usage</p>
                <p className="text-sm text-dark font-body font-medium">{match.usageRights}</p>
              </div>
            )}
          </div>

          <Btn
            size="sm"
            onClick={() => navigate(`/operator/match/${match.id}`, {
              state: { requestId, match },
            })}
          >
            View Details
            <svg className="w-3.5 h-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Btn>
        </div>
      </div>
    </div>
  );
}
