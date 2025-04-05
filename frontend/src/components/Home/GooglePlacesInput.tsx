import React, { useEffect, useRef } from "react";

// Define interfaces for Google Places
interface GooglePlacesProps {
  onSelect: (location: {
    name: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  placeholder?: string;
  className?: string;
}

// You'd need to include the Google Maps script in index.html:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>

const GooglePlacesInput: React.FC<GooglePlacesProps> = ({
  onSelect,
  placeholder = "Search for a location...",
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error(
        "Google Maps JavaScript API is not loaded. Please add the script to your HTML and provide a valid API key."
      );
      return;
    }

    // Initialize autocomplete if input element exists
    if (inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["geocode", "establishment"] }
      );

      // Add listener for place selection
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();

        if (place && place.geometry && place.geometry.location) {
          const location = {
            name: place.name || place.formatted_address || "",
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          };

          onSelect(location);
        }
      });
    }

    // Cleanup listener when component unmounts
    return () => {
      if (window.google && autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onSelect]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
      <p className="mt-2 text-xs text-gray-500">
        To use this component, add the Google Maps Places API script to your
        HTML and replace 'YOUR_API_KEY' with your actual Google API key.
      </p>
    </div>
  );
};

export default GooglePlacesInput;
