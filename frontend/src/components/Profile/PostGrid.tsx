import React from "react";
import { IPost } from "../../types/PostTypes";
import { FaList, FaThLarge, FaHeart, FaRegComment } from "react-icons/fa";

interface PostGridProps {
  posts: IPost[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onPostClick: (post: IPost) => void;
  showViewModeToggle?: boolean; // Proprietate opțională pentru a controla afișarea butoanelor
}

const PostGrid: React.FC<PostGridProps> = ({
  posts,
  viewMode,
  onViewModeChange,
  onPostClick,
  showViewModeToggle = true, // Implicit true, pentru a păstra comportamentul existent
}) => {
  return (
    <div className="w-full">
      {/* View mode toggle - afișat doar dacă showViewModeToggle este true */}
      {showViewModeToggle && (
        <div className="flex justify-center mb-2 border-t border-gray-200 pt-2">
          <div className="flex space-x-4 bg-white rounded-lg shadow-md px-4 py-2">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Grid view"
            >
              <FaThLarge size={20} />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="List view"
            >
              <FaList size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Posts in grid mode */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2">
          {posts.map((post) => (
            <div
              key={post._id}
              className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer group"
              onClick={() => onPostClick(post)}
            >
              {post.image ? (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                  <p className="text-gray-400">No image</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-6 text-white">
                  <div className="flex items-center">
                    <FaHeart className="mr-2" />
                    <span>{post.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <FaRegComment className="mr-2" />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List mode - no placeholder text */}
      {viewMode === "list" && posts.length === 0 && (
        <div className="text-center p-6 bg-white rounded-xl shadow-md">
          <p className="text-gray-500">No posts to display</p>
        </div>
      )}
    </div>
  );
};

export default PostGrid;
