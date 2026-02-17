const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * Simple hook — just checks if the API key is available.
 * No more Google Maps JS script loading; we use the REST API directly.
 */
export default function useGooglePlaces() {
  const isAvailable = !!API_KEY;
  return { isLoaded: isAvailable, isAvailable, apiKey: API_KEY };
}
