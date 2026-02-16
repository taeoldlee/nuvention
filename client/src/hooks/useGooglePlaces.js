import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

let loadPromise = null;

/**
 * Hook that dynamically loads the Google Maps JS API script.
 * Returns { isLoaded, isAvailable } where isAvailable is false if no API key is set.
 */
export default function useGooglePlaces() {
  const [isLoaded, setIsLoaded] = useState(
    typeof window !== 'undefined' && !!window.google?.maps?.places
  );

  const isAvailable = !!API_KEY;

  useEffect(() => {
    if (!isAvailable) return;
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    if (!loadPromise) {
      loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google Maps script failed to load'));
        document.head.appendChild(script);
      });
    }

    loadPromise
      .then(() => setIsLoaded(true))
      .catch((err) => console.warn('[GooglePlaces]', err.message));
  }, [isAvailable]);

  return { isLoaded, isAvailable };
}
