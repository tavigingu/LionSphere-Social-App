import React, { useState } from "react";
import { IUser } from "../../types/AuthTypes";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define search result types
type SearchFilterType = "users" | "tags" | "locations";

interface Location {
  _id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  postCount: number;
}

interface Tag {
  _id: string;
  name: string;
  postCount: number;
}

interface SearchFilterProps {
  searchTerm: string;
  onUserSelect?: (user: IUser) => void;
  onClose?: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onUserSelect,
  onClose,
}) => {
  const [activeFilter, setActiveFilter] = useState<SearchFilterType>("users");
  const [userResults, setUserResults] = useState<IUser[]>([]);
  const [tagResults, setTagResults] = useState<Tag[]>([]);
  const [locationResults, setLocationResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Perform search based on filter and term
  React.useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setUserResults([]);
      setTagResults([]);
      setLocationResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const BASE_URL = "http://localhost:5001";
        let endpoint = "";

        switch (activeFilter) {
          case "users": {
            endpoint = `/user/search?username=${searchTerm}`;
            const userResponse = await axios.get(`${BASE_URL}${endpoint}`);
            if (userResponse.data.success) {
              setUserResults(userResponse.data.users);
            }
            break;
          }
          case "tags": {
            endpoint = `/post/tags/search?tag=${searchTerm}`;
            const tagResponse = await axios.get(`${BASE_URL}${endpoint}`);
            if (tagResponse.data.success) {
              setTagResults(tagResponse.data.tags);
            }
            break;
          }
          case "locations": {
            endpoint = `/post/locations/search?location=${searchTerm}`;
            const locationResponse = await axios.get(`${BASE_URL}${endpoint}`);
            if (locationResponse.data.success) {
              setLocationResults(locationResponse.data.locations);
            }
            break;
          }
        }
      } catch (error) {
        console.error(`Error searching for ${activeFilter}:`, error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchTerm, activeFilter]);

  const handleFilterChange = (filter: SearchFilterType) => {
    setActiveFilter(filter);
  };

  const handleUserClick = (user: IUser) => {
    if (onUserSelect) {
      onUserSelect(user);
    } else {
      navigate(`/profile/${user._id}`);
    }
    if (onClose) onClose();
  };

  const handleTagClick = (tag: Tag) => {
    navigate(`/explore/tag/${tag.name}`);
    if (onClose) onClose();
  };

  const handleLocationClick = (location: Location) => {
    navigate(`/explore/location/${location.name}`, {
      state: {
        coordinates: location.coordinates,
      },
    });
    if (onClose) onClose();
  };

  return (
    <div className="w-full">
      {/* Filter tabs */}
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleFilterChange("users")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeFilter === "users"
              ? "bg-blue-500 text-white"
              : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => handleFilterChange("tags")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeFilter === "tags"
              ? "bg-blue-500 text-white"
              : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
          }`}
        >
          Tags
        </button>
        <button
          onClick={() => handleFilterChange("locations")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeFilter === "locations"
              ? "bg-blue-500 text-white"
              : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
          }`}
        >
          Locations
        </button>
      </div>

      {/* Results area */}
      <div className="mt-2">
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty state */}
        {!loading && searchTerm && (
          <>
            {activeFilter === "users" && userResults.length === 0 && (
              <div className="text-center py-3 text-gray-500">
                No users found
              </div>
            )}
            {activeFilter === "tags" && tagResults.length === 0 && (
              <div className="text-center py-3 text-gray-500">
                No tags found
              </div>
            )}
            {activeFilter === "locations" && locationResults.length === 0 && (
              <div className="text-center py-3 text-gray-500">
                No locations found
              </div>
            )}
          </>
        )}

        {/* User results */}
        {activeFilter === "users" && userResults.length > 0 && (
          <div className="divide-y divide-gray-100">
            {userResults.map((user) => (
              <div
                key={user._id}
                className="py-2 px-1 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-400 to-blue-500">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.firstname} {user.lastname}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tag results */}
        {activeFilter === "tags" && tagResults.length > 0 && (
          <div className="divide-y divide-gray-100">
            {tagResults.map((tag) => (
              <div
                key={tag._id}
                className="py-2 px-1 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => handleTagClick(tag)}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-500">
                    <span className="text-lg">#</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    #{tag.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tag.postCount} {tag.postCount === 1 ? "post" : "posts"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Location results */}
        {activeFilter === "locations" && locationResults.length > 0 && (
          <div className="divide-y divide-gray-100">
            {locationResults.map((location) => (
              <div
                key={location._id}
                className="py-2 px-1 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => handleLocationClick(location)}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-500">
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
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {location.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {location.postCount}{" "}
                    {location.postCount === 1 ? "post" : "posts"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
