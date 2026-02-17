import { useState, useRef, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * Google Places search using the new Places API (REST).
 * Shows autocomplete dropdown + map embed on selection.
 */
export default function GooglePlacesSearch({ onPlaceSelected, disabled = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchPlaces = async (input) => {
    if (!input || input.length < 2 || !API_KEY) return;
    setLoading(true);
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
        },
        body: JSON.stringify({
          input,
          locationBias: {
            circle: {
              center: { latitude: 41.8781, longitude: -87.6298 },
              radius: 50000.0,
            },
          },
        }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions?.filter((s) => s.placePrediction) || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('[GooglePlaces] autocomplete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedPlace(null);
    clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => searchPlaces(val), 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = async (suggestion) => {
    const placeId = suggestion.placePrediction.placeId;
    const name = suggestion.placePrediction.structuredFormat?.mainText?.text || '';
    setQuery(name);
    setShowDropdown(false);

    // Fetch full place details
    try {
      const fields = 'id,displayName,formattedAddress,types,rating,reviews,photos,googleMapsUri,location';
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
        {
          headers: {
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': fields,
          },
        }
      );
      const place = await res.json();

      // Extract photo URLs
      const photoUrls = (place.photos || []).slice(0, 5).map((photo) => {
        const photoRef = photo.name;
        return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=800&key=${API_KEY}`;
      });

      // Extract review text
      // Prefer longer, descriptive reviews (3+ sentences have more signal)
      const allReviews = (place.reviews || [])
        .map((r) => r.text?.text || '')
        .filter(Boolean);
      const reviews = allReviews
        .sort((a, b) => b.length - a.length)
        .slice(0, 10);

      const placeData = {
        placeId,
        name: place.displayName?.text || name,
        address: place.formattedAddress || '',
        types: place.types || [],
        rating: place.rating || null,
        reviews,
        photoUrls,
        googleMapsUrl: place.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      };

      setSelectedPlace({
        name: placeData.name,
        address: placeData.address,
        placeId,
        lat: place.location?.latitude,
        lng: place.location?.longitude,
      });

      onPlaceSelected(placeData);
    } catch (err) {
      console.error('[GooglePlaces] place details error:', err);
    }
  };

  return (
    <div>
      <div ref={wrapperRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          disabled={disabled}
          placeholder="Search for your business..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 animate-spin text-muted" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((s, i) => {
              const pred = s.placePrediction;
              const main = pred.structuredFormat?.mainText?.text || pred.text?.text || '';
              const secondary = pred.structuredFormat?.secondaryText?.text || '';
              return (
                <li
                  key={pred.placeId || i}
                  onClick={() => handleSelect(s)}
                  className="px-4 py-3 hover:bg-bgWarm cursor-pointer border-b border-border/50 last:border-0 transition-colors"
                >
                  <p className="text-sm font-medium text-dark font-body">{main}</p>
                  {secondary && (
                    <p className="text-xs text-muted font-body mt-0.5">{secondary}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedPlace && selectedPlace.lat && (
        <div className="mt-4 rounded-xl overflow-hidden border border-border">
          <iframe
            title="Business location"
            width="100%"
            height="200"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=place_id:${selectedPlace.placeId}&zoom=15`}
          />
          <div className="px-4 py-3 bg-bgWarm">
            <p className="text-sm font-semibold text-dark font-body">{selectedPlace.name}</p>
            <p className="text-xs text-muted font-body">{selectedPlace.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}
