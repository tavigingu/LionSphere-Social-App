// frontend/src/components/Home/TimelineSearch.tsx
import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IUser } from "../../types/AuthTypes";

interface ITag {
  _id: string;
  name: string;
  postCount: number;
}

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimelineSearch: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "users" | "tags" | "locations"
  >("users");
  const [results, setResults] = useState<(IUser | ITag)[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus on input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, activeFilter]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setResults([]);
      setLocationSuggestions([]);
      setError(null);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Perform search for users and tags
  useEffect(() => {
    if (activeFilter === "locations") {
      setResults([]);
      return;
    }

    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const BASE_URL = "http://localhost:5001";
        let endpoint = "";

        switch (activeFilter) {
          case "users":
            endpoint = `/user/search?username=${encodeURIComponent(
              searchTerm
            )}`;
            break;
          case "tags":
            endpoint = `/post/tags/search?query=${encodeURIComponent(
              searchTerm
            )}`;
            break;
        }

        const response = await axios.get(`${BASE_URL}${endpoint}`);
        if (response.data.success) {
          if (activeFilter === "users") {
            setResults(response.data.users);
          } else if (activeFilter === "tags") {
            const formattedTags = response.data.tags.map(
              (tag: { name: string; postCount: number }) => ({
                _id: tag.name,
                name: tag.name,
                postCount: tag.postCount,
              })
            );
            setResults(formattedTags);
          }
        } else {
          setError(`Failed to search ${activeFilter}`);
        }
      } catch (error) {
        setError("An error occurred while searching");
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchTerm, activeFilter]);

  // Perform search for locations using Google Maps API
  useEffect(() => {
    if (activeFilter !== "locations") {
      setLocationSuggestions([]);
      return;
    }

    if (!searchTerm || searchTerm.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setError(
        "Google Maps API not loaded. Please refresh or try again later."
      );
      return;
    }

    const autocomplete = new window.google.maps.places.AutocompleteService();
    const sessionToken = new google.maps.places.AutocompleteSessionToken();

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        autocomplete.getPlacePredictions(
          {
            input: searchTerm,
            types: ["establishment", "geocode"],
            sessionToken,
          },
          (predictions, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setLocationSuggestions(predictions);
            } else {
              setLocationSuggestions([]);
            }
            setLoading(false);
          }
        );
      } catch (err) {
        setError("Could not fetch location suggestions. Please try again.");
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [searchTerm, activeFilter]);

  const handleResultClick = (result: IUser | ITag) => {
    switch (activeFilter) {
      case "users":
        navigate(`/profile/${(result as IUser)._id}`);
        break;
      case "tags":
        navigate(`/explore/tag/${(result as ITag).name}`);
        break;
    }
    onClose();
  };

  const handleLocationSelect = (placeId: string) => {
    const placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );
    placesService.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "geometry", "place_id"],
      },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          const locationName = place.name || place.formatted_address || "";
          const location = {
            name: locationName,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          };
          navigate(`/explore/location/${encodeURIComponent(location.name)}`, {
            state: { coordinates: location.coordinates },
          });
          setError(null);
          setLocationSuggestions([]);
          setSearchTerm("");
          onClose();
        } else {
          setError("No details available for this place.");
        }
      }
    );
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={searchRef}
        className="backdrop-blur-md bg-white/10 rounded-xl p-6 w-full max-w-md mx-4 text-white"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Search</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Search input */}
        <div className="mb-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${activeFilter}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder-gray-400"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-300/30 mb-4">
          <button
            onClick={() => setActiveFilter("users")}
            className={`flex-1 py-3 font-medium ${
              activeFilter === "users"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveFilter("tags")}
            className={`flex-1 py-3 font-medium ${
              activeFilter === "tags"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Tags
          </button>
          <button
            onClick={() => setActiveFilter("locations")}
            className={`flex-1 py-3 font-medium ${
              activeFilter === "locations"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Locations
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-64 overflow-y-auto">
          {error && (
            <div className="bg-red-400/20 border border-red-400/30 text-white px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activeFilter === "locations" ? (
            locationSuggestions.length === 0 &&
            searchTerm.trim().length >= 2 ? (
              <div className="text-center text-gray-400 py-8">
                No locations found
              </div>
            ) : searchTerm.trim().length < 2 ? (
              <div className="text-center text-gray-400 py-8">
                Enter at least 2 characters to search
              </div>
            ) : (
              <div className="space-y-4">
                {locationSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition"
                    onClick={() => handleLocationSelect(suggestion.place_id!)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-400"
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
                      <div>
                        <div className="font-medium text-white">
                          {suggestion.structured_formatting.main_text}
                        </div>
                        <div className="text-sm text-gray-400">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : results.length === 0 && searchTerm.trim().length >= 2 ? (
            <div className="text-center text-gray-400 py-8">
              No {activeFilter} found
            </div>
          ) : searchTerm.trim().length < 2 ? (
            <div className="text-center text-gray-400 py-8">
              Enter at least 2 characters to search
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result._id}
                  className="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition"
                  onClick={() => handleResultClick(result)}
                >
                  {activeFilter === "users" && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        {(result as IUser).profilePicture ? (
                          <img
                            src={(result as IUser).profilePicture}
                            alt={(result as IUser).username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {(result as IUser).username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {(result as IUser).username}
                        </div>
                        <div className="text-sm text-gray-400">
                          {(result as IUser).firstname}{" "}
                          {(result as IUser).lastname}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFilter === "tags" && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-400">
                          #
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          #{(result as ITag).name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {(result as ITag).postCount} posts
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineSearch;
