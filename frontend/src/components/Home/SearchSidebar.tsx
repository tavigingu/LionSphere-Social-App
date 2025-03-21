import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaSearch, FaUser } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IUser } from "../../types/AuthTypes";

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Auto focus the search input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const searchInput = document.getElementById("user-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }, 300); // Delay to allow animation to complete

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle clicks outside to close the sidebar
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

  // Search users by username
  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      console.log("[Frontend] Search term is empty, clearing results");
      setSearchResults([]);
      return;
    }

    console.log("[Frontend] Starting search for:", searchTerm);
    setLoading(true);
    setError(null);

    try {
      console.log(
        "[Frontend] Making request to API:",
        `http://localhost:5001/user/search?username=${searchTerm}`
      );

      const response = await axios.get(
        `http://localhost:5001/user/search?username=${searchTerm}`
      );
      console.log("[Frontend] API Response received:", response);

      if (response.data.success) {
        console.log(
          "[Frontend] Search successful, found",
          response.data.users.length,
          "users"
        );
        setSearchResults(response.data.users);
      } else {
        console.error(
          "[Frontend] Search request failed:",
          response.data.message
        );
        setError("Failed to search users");
      }
    } catch (err) {
      console.error("[Frontend] Error in search request:", err);
      if (axios.isAxiosError(err)) {
        console.error("[Frontend] Axios error details:", {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers,
        });
      }
      setError("An error occurred while searching");
    } finally {
      console.log("[Frontend] Search request completed");
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers();
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 bg-white shadow-xl transition-all duration-300 ease-in-out z-50 ${
        isOpen ? "w-80" : "w-0 opacity-0"
      } overflow-hidden`}
      ref={searchRef}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Search Users</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              id="user-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center flex-grow">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-grow">
            {searchResults.length === 0 && searchTerm ? (
              <div className="text-center text-gray-500 py-8">
                No users found matching '{searchTerm}'
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Search for users by username or name
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => navigateToProfile(user._id)}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user.username}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {user.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.firstname} {user.lastname}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSidebar;
