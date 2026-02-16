import { useRef, useEffect } from 'react';

/**
 * Google Places Autocomplete input.
 * On place selection, extracts structured data and calls onPlaceSelected.
 */
export default function GooglePlacesSearch({ onPlaceSelected, disabled = false }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google?.maps?.places || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment'],
      componentRestrictions: { country: 'us' },
      fields: ['place_id', 'name', 'formatted_address', 'types', 'rating', 'reviews', 'photos', 'geometry'],
    });

    // Bias toward Chicago area
    const chicago = new window.google.maps.LatLng(41.8781, -87.6298);
    const circle = new window.google.maps.Circle({ center: chicago, radius: 50000 });
    autocomplete.setBounds(circle.getBounds());

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place || !place.place_id) return;

      // Extract photo URLs
      const photoUrls = (place.photos || []).slice(0, 5).map((photo) => {
        try {
          return photo.getUrl({ maxWidth: 800 });
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Extract review text
      const reviews = (place.reviews || []).slice(0, 5).map((r) => r.text || '');

      const placeData = {
        placeId: place.place_id,
        name: place.name || '',
        address: place.formatted_address || '',
        types: place.types || [],
        rating: place.rating || null,
        reviews,
        photoUrls,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      };

      onPlaceSelected(placeData);
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelected]);

  return (
    <input
      ref={inputRef}
      type="text"
      disabled={disabled}
      placeholder="Search for your business..."
      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
    />
  );
}
