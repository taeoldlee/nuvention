import { createContext, useContext, useState, useCallback } from 'react';
import { OPERATOR_TOUR_STEPS, CREATOR_TOUR_STEPS } from '../utils/tourSteps';
import TourOverlay from '../components/common/TourOverlay';

const TourContext = createContext(null);

function tourKey(userId) {
  return `locale_tour_done_${userId}`;
}

export function TourProvider({ children }) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [isCreator, setIsCreator] = useState(false);

  const startTour = useCallback((role, userId) => {
    if (userId && localStorage.getItem(tourKey(userId))) return;
    const tourSteps = role === 'creator' ? CREATOR_TOUR_STEPS : OPERATOR_TOUR_STEPS;
    setSteps(tourSteps);
    setIsCreator(role === 'creator');
    setCurrentStep(0);
    setActive(true);
  }, []);

  const completeTour = useCallback((userId) => {
    setActive(false);
    setCurrentStep(0);
    setSteps([]);
    if (userId) localStorage.setItem(tourKey(userId), '1');
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) return prev;
      return prev + 1;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback((userId) => {
    completeTour(userId);
  }, [completeTour]);

  const shouldAutoStart = useCallback((userId) => {
    return !localStorage.getItem(tourKey(userId));
  }, []);

  const resetTour = useCallback((userId) => {
    if (userId) localStorage.removeItem(tourKey(userId));
  }, []);

  return (
    <TourContext.Provider
      value={{ active, currentStep, steps, isCreator, startTour, nextStep, prevStep, skipTour, completeTour, shouldAutoStart, resetTour }}
    >
      {children}
      {active && (
        <TourOverlay
          steps={steps}
          currentStep={currentStep}
          isCreator={isCreator}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          onComplete={completeTour}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
