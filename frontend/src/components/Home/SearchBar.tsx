import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchFilter from "./SearchFilter";

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFocus = () => {
    setIsExpanded(true);
    if (searchTerm.trim().length > 1) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    if (!showResults) {
      setIsExpanded(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 1) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search submission logic here if needed
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setIsExpanded(false);
    setSearchTerm("");
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSearchSubmit}>
        <div
          className={`flex items-center ${
            isExpanded
              ? "bg-white shadow-md"
              : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
          } rounded-full transition-all duration-300 overflow-hidden`}
        >
          <div className="pl-4 pr-2 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`py-2 pr-4 focus:outline-none ${
              isExpanded
                ? "w-64 text-gray-800"
                : "w-32 bg-transparent text-white placeholder-white/70"
            } transition-all duration-300`}
          />
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-20 overflow-hidden max-h-[80vh] overflow-y-auto"
          >
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Search Results
                </h3>
                <button
                  onClick={handleCloseResults}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <SearchFilter
                searchTerm={searchTerm}
                onClose={handleCloseResults}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
