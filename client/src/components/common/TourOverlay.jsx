import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';

function getPlacement(targetRect, tooltipEl, preferred) {
  if (!tooltipEl) return preferred;
  const pad = 16;
  const { innerWidth: vw, innerHeight: vh } = window;
  const tw = tooltipEl.offsetWidth;
  const th = tooltipEl.offsetHeight;

  const fits = {
    bottom: targetRect.bottom + th + pad + 12 < vh,
    top: targetRect.top - th - pad - 12 > 0,
    right: targetRect.right + tw + pad + 12 < vw,
    left: targetRect.left - tw - pad - 12 > 0,
  };

  if (fits[preferred]) return preferred;
  for (const dir of ['bottom', 'top', 'right', 'left']) {
    if (fits[dir]) return dir;
  }
  return 'bottom';
}

function getTooltipStyle(targetRect, placement) {
  const gap = 12;
  switch (placement) {
    case 'bottom':
      return { top: targetRect.bottom + gap, left: targetRect.left + targetRect.width / 2, transform: 'translateX(-50%)' };
    case 'top':
      return { top: targetRect.top - gap, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
    case 'right':
      return { top: targetRect.top + targetRect.height / 2, left: targetRect.right + gap, transform: 'translateY(-50%)' };
    case 'left':
      return { top: targetRect.top + targetRect.height / 2, left: targetRect.left - gap, transform: 'translate(-100%, -50%)' };
    default:
      return { top: targetRect.bottom + gap, left: targetRect.left + targetRect.width / 2, transform: 'translateX(-50%)' };
  }
}

function getArrowStyle(placement, isCreator) {
  const color = isCreator ? '#0D9488' : '#B85042';
  const base = { position: 'absolute', width: 0, height: 0 };
  const size = 8;
  switch (placement) {
    case 'bottom':
      return { ...base, top: -size, left: '50%', transform: 'translateX(-50%)', borderLeft: `${size}px solid transparent`, borderRight: `${size}px solid transparent`, borderBottom: `${size}px solid ${color}` };
    case 'top':
      return { ...base, bottom: -size, left: '50%', transform: 'translateX(-50%)', borderLeft: `${size}px solid transparent`, borderRight: `${size}px solid transparent`, borderTop: `${size}px solid ${color}` };
    case 'right':
      return { ...base, left: -size, top: '50%', transform: 'translateY(-50%)', borderTop: `${size}px solid transparent`, borderBottom: `${size}px solid transparent`, borderRight: `${size}px solid ${color}` };
    case 'left':
      return { ...base, right: -size, top: '50%', transform: 'translateY(-50%)', borderTop: `${size}px solid transparent`, borderBottom: `${size}px solid transparent`, borderLeft: `${size}px solid ${color}` };
    default:
      return base;
  }
}

export default function TourOverlay({ steps, currentStep, isCreator, onNext, onPrev, onSkip, onComplete }) {
  const { user } = useAuth();
  const [targetRect, setTargetRect] = useState(null);
  const [placement, setPlacement] = useState('bottom');
  const tooltipRef = useRef(null);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const accentClass = isCreator ? 'bg-creatorAccent' : 'bg-accent';
  const accentHoverClass = isCreator ? 'hover:bg-teal-700' : 'hover:bg-red-800';
  const accentBorder = isCreator ? 'border-creatorAccent' : 'border-accent';
  const accentText = isCreator ? 'text-creatorAccent' : 'text-accent';

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    const dir = getPlacement(rect, tooltipRef.current, step.placement);
    setPlacement(dir);
  }, [step]);

  // Scroll target into view and measure on step change, with retries
  useEffect(() => {
    if (!step) return;
    let attempts = 0;
    const maxAttempts = 10;
    let timer;

    function tryFind() {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        timer = setTimeout(measure, 400);
      } else if (attempts < maxAttempts) {
        attempts++;
        timer = setTimeout(tryFind, 200);
      }
    }

    tryFind();
    return () => clearTimeout(timer);
  }, [step, measure]);

  // Re-measure on resize/scroll
  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  // Re-measure after tooltip renders (for placement calc)
  useEffect(() => {
    if (targetRect && tooltipRef.current) {
      const dir = getPlacement(targetRect, tooltipRef.current, step?.placement);
      setPlacement(dir);
    }
  }, [targetRect]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') return; // Don't dismiss on Escape — require explicit skip
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isLast) onComplete(user?.id);
        else onNext();
        return;
      }
      if (e.key === 'ArrowLeft' && !isFirst) { onPrev(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLast, isFirst, onNext, onPrev, onSkip, onComplete, user?.id]);

  if (!targetRect) return null;

  const spotlightPad = 8;
  const tooltipStyle = getTooltipStyle(targetRect, placement);

  // Clamp tooltip to viewport
  const clampedStyle = { ...tooltipStyle, position: 'fixed', zIndex: 61, maxWidth: 'min(340px, calc(100vw - 32px))' };

  return createPortal(
    <div className="fixed inset-0 z-[60]" aria-modal="true" role="dialog">
      {/* Backdrop — blocks clicks but does NOT dismiss tour */}
      <div className="fixed inset-0" style={{ background: 'transparent' }} />

      {/* Spotlight cutout */}
      <div
        className="fixed pointer-events-none transition-all duration-300 ease-in-out rounded-xl"
        style={{
          top: targetRect.top - spotlightPad,
          left: targetRect.left - spotlightPad,
          width: targetRect.width + spotlightPad * 2,
          height: targetRect.height + spotlightPad * 2,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          borderRadius: 12,
        }}
      />

      {/* Tooltip */}
      <div ref={tooltipRef} style={clampedStyle}>
        {/* Arrow */}
        <div style={getArrowStyle(placement, isCreator)} />

        <div className={`rounded-xl shadow-xl border ${accentBorder} overflow-hidden`}>
          {/* Header bar */}
          <div className={`${accentClass} px-4 py-2.5`}>
            <p className="text-white text-sm font-semibold font-body">{step.title}</p>
          </div>

          {/* Body */}
          <div className="bg-white px-4 py-3">
            <p className="text-sm text-dark font-body leading-relaxed">{step.body}</p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3 mb-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? `${accentClass} w-4`
                      : i < currentStep
                        ? `${accentClass} opacity-40 w-1.5`
                        : 'bg-gray-300 w-1.5'
                  }`}
                />
              ))}
            </div>

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => onSkip(user?.id)}
                className="text-xs text-muted font-body hover:text-dark transition-colors"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    onClick={onPrev}
                    className={`text-xs font-semibold font-body ${accentText} hover:opacity-80 transition-opacity`}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => isLast ? onComplete(user?.id) : onNext()}
                  className={`${accentClass} ${accentHoverClass} text-white text-xs font-semibold font-body px-3 py-1.5 rounded-lg transition-colors`}
                >
                  {isLast ? 'Done' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
