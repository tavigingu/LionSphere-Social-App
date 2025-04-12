import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { debounce } from "lodash";

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  // We don't need extra props for notifications as they're handled by backend
}

const MentionsInput: React.FC<MentionsInputProps> = ({
  value,
  onChange,
  placeholder,
  onSubmit,
  className,
}) => {
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionPosition, setMentionPosition] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (query.trim().length > 0) {
        try {
          const response = await axios.get(
            `http://localhost:5001/user/search?username=${encodeURIComponent(
              query
            )}`
          );
          if (response.data.success) {
            setSuggestions(response.data.users);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Error searching users:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300)
  ).current;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = e.target.selectionStart || 0;
    const lastAtPos = newValue.lastIndexOf("@", cursorPos - 1);

    if (lastAtPos !== -1 && cursorPos > lastAtPos) {
      const textBetweenAtAndCursor = newValue.substring(
        lastAtPos + 1,
        cursorPos
      );
      if (!textBetweenAtAndCursor.includes(" ")) {
        setMentionSearch(textBetweenAtAndCursor);
        setMentionPosition(lastAtPos);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        setMentionSearch(null);
        setMentionPosition(null);
      }
    } else {
      setShowSuggestions(false);
      setMentionSearch(null);
      setMentionPosition(null);
    }
  };

  const insertMention = (user: User) => {
    if (mentionPosition !== null) {
      const before = value.substring(0, mentionPosition);
      const after = value.substring(
        mentionPosition + (mentionSearch?.length || 0) + 1
      );
      const newValue = `${before}@${user.username} ${after}`;
      onChange(newValue);

      if (inputRef.current) {
        setTimeout(() => {
          const newCursorPos = mentionPosition + user.username.length + 2;
          inputRef.current!.selectionStart = newCursorPos;
          inputRef.current!.selectionEnd = newCursorPos;
          inputRef.current!.focus();
        }, 0);
      }
    }
    setShowSuggestions(false);
    setMentionSearch(null);
    setMentionPosition(null);
  };

  useEffect(() => {
    debouncedSearch(mentionSearch || "");
    return () => {
      debouncedSearch.cancel();
    };
  }, [mentionSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      <form onSubmit={onSubmit} className="flex items-center w-full gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`flex-1 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 placeholder-gray-400 ${
            className || ""
          }`}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className={`bg-blue-500 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-all duration-200 ${
            !value.trim()
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-600 active:scale-95"
          }`}
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto transform -translate-y-2 transition-all duration-150 ease-in-out"
          style={{ width: "100%", maxWidth: "300px", bottom: "48px" }}
        >
          {suggestions.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {suggestions.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-100"
                  onClick={() => insertMention(user)}
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden mr-3 border border-gray-200">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-800 text-sm">
                    {user.username}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm italic">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentionsInput;
