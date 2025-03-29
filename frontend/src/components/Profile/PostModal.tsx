import React, { useState, useEffect } from "react";
import { IPost, IComment } from "../../types/PostTypes";
import useAuthStore from "../../store/AuthStore";
import usePostStore from "../../store/PostStore";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaRegComment,
} from "react-icons/fa";
import axios from "axios";

interface PostModalProps {
  post: IPost | null;
  onClose: () => void;
  onLike?: (postId: string) => Promise<void>;
  onSave?: (postId: string) => Promise<void>;
}

const PostModal: React.FC<PostModalProps> = ({
  post,
  onClose,
  onLike,
  onSave,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { addComment } = usePostStore();
  const [postUser, setPostUser] = useState<{
    profilePicture?: string;
    username: string;
    firstname?: string;
    lastname?: string;
  } | null>(null);
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
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [localComments, setLocalComments] = useState<IComment[]>([]);

  // Initialize state
  useEffect(() => {
    if (post && currentUser) {
      setIsLiked(post.likes.includes(currentUser._id));
      setIsSaved(post.savedBy?.includes(currentUser._id) || false);
      setLocalComments(post.comments || []);
    }
  }, [post, currentUser]);

  // Fetch post author details
  useEffect(() => {
    const fetchUserData = async () => {
      if (!post) return;
      try {
        const response = await axios.get(
          `http://localhost:5001/user/${post.userId}`
        );
        if (response.data.success) setPostUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, [post]);

  // Fetch comment authors' details
  useEffect(() => {
    const fetchCommentUsers = async () => {
      if (!post?.comments || post.comments.length === 0) return;

      const uniqueUserIds = [
        ...new Set(post.comments.map((comment) => comment.userId)),
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
  }, [post?.comments]);

  const handleLike = async () => {
    if (!post?._id || !currentUser) return;

    // Optimistically update UI
    setIsLiked(!isLiked);

    // Call the API
    if (onLike) {
      try {
        await onLike(post._id);
      } catch (error) {
        // Revert on error
        setIsLiked(isLiked);
        console.error("Error liking post:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!post?._id || !currentUser) return;

    // Optimistically update UI
    setIsSaved(!isSaved);

    // Call the API
    if (onSave) {
      try {
        await onSave(post._id);
      } catch (error) {
        // Revert on error
        setIsSaved(isSaved);
        console.error("Error saving post:", error);
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?._id || !currentUser?._id || !commentText.trim()) return;

    try {
      await addComment(post._id, currentUser._id, commentText);

      // Add comment to local state for immediate feedback
      const newComment: IComment = {
        userId: currentUser._id,
        text: commentText,
        createdAt: new Date().toISOString(),
      };

      setLocalComments([...localComments, newComment]);
      setCommentText("");

      // Add current user to commentUsers if not already there
      if (!commentUsers[currentUser._id]) {
        setCommentUsers({
          ...commentUsers,
          [currentUser._id]: {
            username: currentUser.username,
            profilePicture: currentUser.profilePicture,
          },
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  // If no post is provided, don't render anything
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 flex items-center justify-center">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-900 bg-opacity-50 rounded-full p-2 z-10 hover:bg-opacity-70 transition-colors"
        >
          <FaTimes size={20} />
        </button>

        {/* Left side - Image */}
        <div className="w-full md:w-7/12 h-[90vh] md:h-auto bg-black flex items-center">
          {post.image ? (
            <img
              src={post.image}
              alt="Post"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
              <p className="text-gray-600">No image</p>
            </div>
          )}
        </div>

        {/* Right side - Post details and comments */}
        <div className="hidden md:flex md:w-5/12 flex-col h-[90vh]">
          {/* Post author header */}
          <div className="p-4 border-b flex items-center">
            <div
              className="h-10 w-10 rounded-full overflow-hidden cursor-pointer"
              onClick={() => post.userId && navigateToProfile(post.userId)}
            >
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
            <div
              className="ml-3 cursor-pointer"
              onClick={() => post.userId && navigateToProfile(post.userId)}
            >
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

          {/* Comments section */}
          <div className="flex-grow overflow-y-auto p-4 border-b">
            {/* Post caption */}
            {post.desc && (
              <div className="flex mb-6">
                <div
                  className="h-8 w-8 rounded-full overflow-hidden mr-2 cursor-pointer"
                  onClick={() => post.userId && navigateToProfile(post.userId)}
                >
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
                <div>
                  <p className="text-sm">
                    <span
                      className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                      onClick={() =>
                        post.userId && navigateToProfile(post.userId)
                      }
                    >
                      {postUser?.username || "Unknown User"}
                    </span>{" "}
                    <span className="text-gray-800">{post.desc}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-4">
              {localComments.map((comment, index) => (
                <div key={comment._id || index} className="flex">
                  <div
                    className="h-8 w-8 rounded-full overflow-hidden mr-2 cursor-pointer"
                    onClick={() => navigateToProfile(comment.userId)}
                  >
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
                    <p className="text-sm">
                      <span
                        className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                        onClick={() => navigateToProfile(comment.userId)}
                      >
                        {commentUsers[comment.userId]?.username ||
                          "Unknown User"}
                      </span>{" "}
                      <span className="text-gray-800">{comment.text}</span>
                    </p>
                    {comment.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions section */}
          <div className="p-4 border-b">
            <div className="flex justify-between mb-2">
              <div className="flex space-x-4">
                <button
                  onClick={handleLike}
                  className="transition-colors focus:outline-none"
                >
                  {isLiked ? (
                    <FaHeart className="text-2xl text-red-500" />
                  ) : (
                    <FaRegHeart className="text-2xl text-gray-700 hover:text-red-500" />
                  )}
                </button>
                <button className="transition-colors focus:outline-none">
                  <FaRegComment className="text-2xl text-gray-700 hover:text-blue-500" />
                </button>
              </div>
              <button
                onClick={handleSave}
                className="transition-colors focus:outline-none"
              >
                {isSaved ? (
                  <FaBookmark className="text-2xl text-yellow-500" />
                ) : (
                  <FaRegBookmark className="text-2xl text-gray-700 hover:text-yellow-500" />
                )}
              </button>
            </div>
            <p className="font-semibold text-sm text-gray-800">
              {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
            </p>
          </div>

          {/* Add comment section */}
          <div className="p-4">
            <form className="flex items-center" onSubmit={handleComment}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`ml-2 px-4 py-2 rounded-full text-sm font-medium ${
                  !commentText.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white transition-colors`}
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
