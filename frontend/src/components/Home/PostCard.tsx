import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaEllipsisV,
  FaTrash,
} from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
//import { IPost } from "../types/PostTypes";
import useAuthStore from "../../store/AuthStore";
import usePostStore from "../../store/PostStore";
import axios from "axios";

interface PostCardProps {
  _id: string;
  userId: string;
  desc: string;
  image?: string;
  likes: string[];
  comments?: {
    userId: string;
    text: string;
    _id?: string;
    createdAt?: string;
  }[];
  onLike?: () => void;
  isLiked?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  _id,
  userId,
  desc,
  likes,
  image,
  comments = [],
  onLike,
  isLiked = false,
}) => {
  const { user: currentUser } = useAuthStore();
  const { addComment, deletePost } = usePostStore();
  const [postUser, setPostUser] = useState<{
    profilePicture?: string;
    username: string;
    firstname?: string;
    lastname?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [commentUsers, setCommentUsers] = useState<
    Record<
      string,
      {
        username: string;
        profilePicture?: string;
      }
    >
  >({});
  const [commentText, setCommentText] = useState("");

  const handleDeletePost = async () => {
    if (_id && currentUser) {
      try {
        await deletePost(_id, currentUser._id);
        setShowMenu(false);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5001/user/${userId}`
        );
        if (response.data.success) setPostUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchCommentUsers = async () => {
      if (!comments || comments.length === 0) return;
      const uniqueUserIds = [
        ...new Set(comments.map((comment) => comment.userId)),
      ];
      const newCommentUsers: Record<
        string,
        { username: string; profilePicture?: string }
      > = {};
      for (const commentUserId of uniqueUserIds) {
        try {
          const response = await axios.get(
            `http://localhost:5001/user/${commentUserId}`
          );
          if (response.data.success)
            newCommentUsers[commentUserId] = {
              username: response.data.user.username,
              profilePicture: response.data.user.profilePicture,
            };
        } catch (error) {
          console.error(
            `Failed to fetch user data for comment user ${commentUserId}:`,
            error
          );
        }
      }
      setCommentUsers(newCommentUsers);
    };
    fetchCommentUsers();
  }, [comments]);

  // Handle outside clicks to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6 max-w-xl">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full border border-blue-500 overflow-hidden">
            {postUser?.profilePicture ? (
              <img
                src={postUser.profilePicture}
                alt={`${postUser.username}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {postUser?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">
              {postUser?.username || "Unknown User"}
            </h3>
            {postUser?.firstname && postUser?.lastname && (
              <p className="text-xs text-gray-500">
                {postUser.firstname} {postUser.lastname}
              </p>
            )}
          </div>
        </div>

        {/* Three dots menu - only show if current user is the post owner or an admin */}
        {currentUser &&
          (currentUser._id === userId || currentUser.role === "admin") && (
            <div className="relative" ref={menuRef}>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowMenu(!showMenu)}
              >
                <FaEllipsisV />
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 rounded-md"
                    onClick={handleDeletePost}
                  >
                    <FaTrash className="mr-2" />
                    Delete post
                  </button>
                </div>
              )}
            </div>
          )}
      </div>
      <div className="w-full h-[400px] sm:h-[400px] bg-gray-100">
        {image ? (
          <img src={image} alt="Post" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
            <p className="text-gray-400">No image</p>
          </div>
        )}
      </div>
      <div className="px-4 py-3 flex space-x-6">
        <button
          onClick={onLike}
          className="flex items-center transition-colors"
        >
          {isLiked ? (
            <div className="flex items-center">
              <FaHeart
                className="mr-2 text-2xl text-purple-500 filter drop-shadow-lg"
                style={{
                  filter: "drop-shadow(0 0 3px rgba(147, 51, 234, 0.5))",
                }}
              />
              <span className="text-purple-500">{likes.length}</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-700 hover:text-purple-500 transition-colors">
              <FaRegHeart className="text-2xl" />
              <span className="ml-2 text-sm">{likes.length}</span>
            </div>
          )}
        </button>
        <button
          className="flex items-center text-gray-700 hover:text-blue-500 transition-colors"
          onClick={() => setShowAllComments(!showAllComments)}
        >
          <div className="flex items-center">
            <FaRegComment className="text-2xl" />
            <span className="ml-2 text-sm">{comments.length}</span>
          </div>
        </button>
      </div>
      <div className="px-4 pb-3">
        <div className="flex">
          <h4 className="font-semibold text-gray-800">
            {postUser?.username || "Unknown User"}
          </h4>
          <p className="text-gray-800 ml-2">{desc}</p>
        </div>
      </div>
      {comments.length > 0 && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3">
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {(showAllComments ? comments : comments.slice(0, 1)).map(
              (comment, index) => (
                <div key={comment._id || index} className="flex mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    {commentUsers[comment.userId]?.profilePicture ? (
                      <img
                        src={commentUsers[comment.userId].profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {commentUsers[comment.userId]?.username
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <p className="text-sm font-medium text-gray-800">
                        {commentUsers[comment.userId]?.username ||
                          "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                    {comment.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
          {comments.length > 1 && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-blue-500 hover:text-blue-700 text-sm mt-2 transition-colors"
            >
              {showAllComments
                ? "Show less"
                : `View all ${comments.length} comments`}
            </button>
          )}
        </div>
      )}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <form
          className="flex items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (commentText.trim() && currentUser?._id && _id) {
              addComment(_id, currentUser._id, commentText)
                .then(() => {
                  setCommentText("");
                  if (!commentUsers[currentUser._id]) {
                    setCommentUsers({
                      ...commentUsers,
                      [currentUser._id]: {
                        username: currentUser.username,
                        profilePicture: currentUser.profilePicture,
                      },
                    });
                  }
                  setShowAllComments(true);
                })
                .catch((error) =>
                  console.error("Error adding comment:", error)
                );
            }
          }}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt="Your profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border text-gray-500 border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className={`ml-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center ${
              !commentText.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostCard;
