import { FaHeart, FaRegHeart, FaComment, FaShare } from "react-icons/fa";
import React from "react";
import { IPost } from "../types/PostTypes";

interface PostCardProps extends IPost {
  onLike?: () => void;
  isLiked?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  _id,
  userId,
  username,
  desc,
  likes,
  image,
  onLike,
  isLiked = false,
}) => {
  return (
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl min-h-[500px] sm:min-h-[600px] lg:min-h-[800px] lg:min-w-[750px] backdrop-blur-sm bg-white/5 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl flex flex-col">
      {/* Header cu username-ul și imaginea utilizatorului care postează */}
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full border border-green-500 flex items-center justify-center mr-4">
          <span className="text-gray-400 text-xs">No Image</span>
        </div>
        <span className="text-white font-medium text-base sm:text-lg">
          {username}
        </span>
      </div>

      {/* Imaginea principală a postării */}
      <div className="flex-grow relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-lg overflow-hidden">
          {image ? (
            <img
              src={image}
              alt="Post Image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              No Post Image
            </div>
          )}
        </div>
      </div>

      {/* Interacțiuni (like, comment, share) */}
      <div className="flex items-center justify-between mb-4 text-sm sm:text-base">
        <button
          onClick={onLike}
          className={`flex items-center ${
            isLiked ? "text-red-500" : "text-gray-300 hover:text-red-500"
          } transition-colors`}
        >
          {isLiked ? (
            <FaHeart className="mr-2 size-4 sm:size-5" />
          ) : (
            <FaRegHeart className="mr-2 size-4 sm:size-5" />
          )}
          {likes.length} {likes.length === 1 ? "Like" : "Likes"}
        </button>
        <button className="flex items-center text-gray-300 hover:text-blue-500 transition-colors">
          <FaComment className="mr-2 size-4 sm:size-5" /> Comment
        </button>
        <button className="flex items-center text-gray-300 hover:text-green-500 transition-colors">
          <FaShare className="mr-2 size-4 sm:size-5" /> Share
        </button>
      </div>

      {/* Descrierea */}
      <div>
        <p className="text-gray-300 text-sm sm:text-base mb-8">{desc}</p>
      </div>

      {/* Comment section - can be expanded */}
      <div className="mt-auto border-t border-gray-700 pt-4">
        <div className="flex">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center mr-2">
            <span className="text-gray-400 text-xs">U</span>
          </div>
          <input
            type="text"
            placeholder="Scrie un comentariu..."
            className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 px-2 py-1 text-white text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PostCard;
