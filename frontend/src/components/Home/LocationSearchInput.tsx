import React, { useEffect, useRef, useState } from "react";

interface LocationSearchInputProps {
  onSelect: (location: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }) => void;
  placeholder?: string;
  className?: string;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onSelect,
  placeholder = "Search for a location...",
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps API is not loaded properly.");
      setError(
        "Google Maps API not loaded. Please refresh or try again later."
      );
      return;
    }

    // Initialize autocomplete if input element exists
    if (inputRef.current) {
      try {
        // Create the autocomplete instance
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["establishment", "geocode"], // Search for places and addresses
            fields: ["name", "formatted_address", "geometry", "place_id"], // Specify the data we want to get back
          }
        );

        // Add listener for place selection
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();

          if (place && place.geometry && place.geometry.location) {
            const locationName = place.name || place.formatted_address || "";

            const location = {
              name: locationName,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            };

            onSelect(location);
            setError(null);
          } else {
            setError("No details available for this place.");
          }
        });
      } catch (err) {
        console.error("Error initializing Google Places Autocomplete:", err);
        setError("Could not initialize location search. Please try again.");
      }
    }

    // Cleanup listener when component unmounts
    return () => {
      if (window.google && autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [onSelect]);

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center border  text-gray-500 border-gray-300 rounded-md overflow-hidden ${className}`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="flex-grow px-3 py-2 focus:outline-none"
        />
        <div className="p-2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-1 text-xs text-gray-500">
        Start typing to search for locations
      </p>
    </div>
  );
};

export default LocationSearchInput;
