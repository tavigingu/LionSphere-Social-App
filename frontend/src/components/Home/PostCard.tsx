import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaEllipsisV,
  FaTrash,
  FaBookmark,
  FaRegBookmark,
  FaReply,
  FaRegPaperPlane,
} from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/AuthStore";
import usePostStore from "../../store/PostStore";
import axios from "axios";
import UserListModal from "../UserListModal";

interface PostCardProps {
  _id: string;
  userId: string;
  desc: string;
  image?: string;
  likes: string[];
  savedBy?: string[];
  comments?: {
    _id?: string;
    userId: string;
    text: string;
    likes?: string[];
    createdAt?: string;
    replies?: {
      _id?: string;
      userId: string;
      text: string;
      likes?: string[];
      createdAt?: string;
    }[];
  }[];
  onLike?: () => void;
  onSave?: () => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  _id,
  userId,
  desc,
  likes,
  savedBy = [],
  image,
  comments = [],
  onLike,
  onSave,
  isLiked = false,
  isSaved = false,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const {
    addComment,
    deletePost,
    savePost,
    replyToComment,
    likeComment,
    likeReply,
  } = usePostStore();
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
  const [commentUsers, setCommentUsers] = useState<{
    [key: string]: {
      username: string;
      profilePicture?: string;
    };
  }>({});
  const [commentText, setCommentText] = useState("");
  const [localSaved, setLocalSaved] = useState(isSaved);

  // New state for comment replies
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // New state for local comment management to avoid refreshes
  const [localComments, setLocalComments] = useState(comments);

  // Actualizăm starea locală când props-ul se schimbă
  useEffect(() => {
    setLocalSaved(isSaved);
    setLocalComments(comments);
  }, [isSaved, comments]);

  // State for UserListModal
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [isCommentLikesModalOpen, setIsCommentLikesModalOpen] = useState<
    string | null
  >(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

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

  // Funcție pentru salvarea postării cu actualizarea stării locale
  const handleSavePost = async () => {
    if (_id && currentUser) {
      try {
        // Actualizăm starea locală preventiv pentru UX mai bun
        setLocalSaved(!localSaved);

        // Executăm acțiunea reală de save/unsave
        await savePost(_id, currentUser._id);

        // Apelăm callback-ul pentru a notifica părintele
        if (onSave) onSave();
      } catch (error) {
        // Revertim starea locală în caz de eroare
        setLocalSaved(localSaved);
        console.error("Error saving post:", error);
      }
    }
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Function to handle adding a comment with instant feedback
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && currentUser?._id && _id) {
      // Create a temporary local comment
      const newComment = {
        _id: `temp-${Date.now()}`,
        userId: currentUser._id,
        text: commentText,
        likes: [],
        createdAt: new Date().toISOString(),
        replies: [],
      };

      // Add it to local state immediately
      setLocalComments([...localComments, newComment]);

      // Reset the input
      setCommentText("");

      try {
        // Actually send it to the server
        await addComment(_id, currentUser._id, commentText);

        // Update the commentUsers map
        if (!commentUsers[currentUser._id]) {
          setCommentUsers({
            ...commentUsers,
            [currentUser._id]: {
              username: currentUser.username,
              profilePicture: currentUser.profilePicture,
            },
          });
        }

        // Make sure all comments are visible
        setShowAllComments(true);
      } catch (error) {
        console.error("Error adding comment:", error);
        // Remove the temp comment if there was an error
        setLocalComments(localComments.filter((c) => c._id !== newComment._id));
      }
    }
  };

  // Function to handle replying to a comment
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (replyText.trim() && currentUser?._id && _id && replyingTo) {
      // Find the comment we're replying to
      const commentIndex = localComments.findIndex((c) => c._id === replyingTo);

      if (commentIndex !== -1) {
        // Create a temporary reply
        const newReply = {
          _id: `temp-reply-${Date.now()}`,
          userId: currentUser._id,
          text: replyText,
          likes: [],
          createdAt: new Date().toISOString(),
        };

        // Create a new array of comments with the reply added
        const updatedComments = [...localComments];
        if (!updatedComments[commentIndex].replies) {
          updatedComments[commentIndex].replies = [];
        }
        updatedComments[commentIndex].replies!.push(newReply);

        // Update local state
        setLocalComments(updatedComments);

        // Reset input and replyingTo
        setReplyText("");
        setReplyingTo(null);

        try {
          // Actually send to server
          await replyToComment(_id, replyingTo, currentUser._id, replyText);

          // Make sure the comment user is in our map
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
          console.error("Error adding reply:", error);
          // Remove the temporary reply if there was an error
          const fallbackComments = [...localComments];
          if (fallbackComments[commentIndex].replies) {
            fallbackComments[commentIndex].replies = fallbackComments[
              commentIndex
            ].replies!.filter((r) => r._id !== newReply._id);
          }
          setLocalComments(fallbackComments);
        }
      }
    }
  };

  // Function to handle liking a comment
  const handleLikeComment = async (commentId: string) => {
    if (!currentUser?._id || !_id) return;

    // Find the comment
    const commentIndex = localComments.findIndex((c) => c._id === commentId);

    if (commentIndex !== -1) {
      // Check if already liked
      const isLiked =
        localComments[commentIndex].likes?.includes(currentUser._id) || false;

      // Update local state immediately
      const updatedComments = [...localComments];
      if (!updatedComments[commentIndex].likes) {
        updatedComments[commentIndex].likes = [];
      }

      if (isLiked) {
        updatedComments[commentIndex].likes = updatedComments[
          commentIndex
        ].likes!.filter((id) => id !== currentUser._id);
      } else {
        updatedComments[commentIndex].likes!.push(currentUser._id);
      }

      setLocalComments(updatedComments);

      // Send to server
      try {
        await likeComment(_id, commentId, currentUser._id);
      } catch (error) {
        console.error("Error liking comment:", error);
        // Revert if error
        setLocalComments(localComments);
      }
    }
  };

  // Function to handle liking a reply
  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!currentUser?._id || !_id) return;

    // Find the comment and reply
    const commentIndex = localComments.findIndex((c) => c._id === commentId);

    if (commentIndex !== -1 && localComments[commentIndex].replies) {
      const replyIndex = localComments[commentIndex].replies!.findIndex(
        (r) => r._id === replyId
      );

      if (replyIndex !== -1) {
        // Check if already liked
        const isLiked =
          localComments[commentIndex].replies![replyIndex].likes?.includes(
            currentUser._id
          ) || false;

        // Update local state immediately
        const updatedComments = [...localComments];
        if (!updatedComments[commentIndex].replies![replyIndex].likes) {
          updatedComments[commentIndex].replies![replyIndex].likes = [];
        }

        if (isLiked) {
          updatedComments[commentIndex].replies![replyIndex].likes =
            updatedComments[commentIndex].replies![replyIndex].likes!.filter(
              (id) => id !== currentUser._id
            );
        } else {
          updatedComments[commentIndex].replies![replyIndex].likes!.push(
            currentUser._id
          );
        }

        setLocalComments(updatedComments);

        // Send to server
        try {
          await likeReply(_id, commentId, replyId, currentUser._id);
        } catch (error) {
          console.error("Error liking reply:", error);
          // Revert if error
          setLocalComments(localComments);
        }
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
      if (!localComments || localComments.length === 0) return;

      // Get all user IDs from comments and replies
      const userIds = new Set<string>();

      localComments.forEach((comment) => {
        userIds.add(comment.userId);

        if (comment.replies) {
          comment.replies.forEach((reply) => {
            userIds.add(reply.userId);
          });
        }
      });

      const uniqueUserIds = Array.from(userIds);
      const newCommentUsers: Record<
        string,
        { username: string; profilePicture?: string }
      > = { ...commentUsers };

      for (const commentUserId of uniqueUserIds) {
        // Skip if we already have this user
        if (newCommentUsers[commentUserId]) continue;

        try {
          const response = await axios.get(
            `http://localhost:5001/user/${commentUserId}`
          );
          if (response.data.success) {
            newCommentUsers[commentUserId] = {
              username: response.data.user.username,
              profilePicture: response.data.user.profilePicture,
            };
          }
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
  }, [localComments]);

  // Function to fetch users who liked the post
  const fetchLikes = async (page: number, limit: number) => {
    try {
      // In a real application, you would make an API call here
      // For now, we'll simulate a response by using the likes array
      const likedUsers = [];

      // Get users for each like ID (with pagination)
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, likes.length);

      for (let i = startIndex; i < endIndex; i++) {
        if (i >= likes.length) break;

        try {
          const response = await axios.get(
            `http://localhost:5001/user/${likes[i]}`
          );
          if (response.data.success) {
            likedUsers.push(response.data.user);
          }
        } catch (error) {
          console.error(
            `Failed to fetch user data for like ID ${likes[i]}:`,
            error
          );
        }
      }

      return {
        users: likedUsers,
        hasMore: endIndex < likes.length,
      };
    } catch (error) {
      console.error("Error fetching likes:", error);
      return { users: [], hasMore: false };
    }
  };

  // Function to fetch users who liked a comment
  const fetchCommentLikes = async (
    commentId: string,
    page: number,
    limit: number
  ) => {
    try {
      const comment = localComments.find((c) => c._id === commentId);
      if (!comment || !comment.likes || comment.likes.length === 0) {
        return { users: [], hasMore: false };
      }

      const commentLikes = comment.likes;
      const likedUsers = [];

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, commentLikes.length);

      for (let i = startIndex; i < endIndex; i++) {
        if (i >= commentLikes.length) break;

        try {
          const response = await axios.get(
            `http://localhost:5001/user/${commentLikes[i]}`
          );
          if (response.data.success) {
            likedUsers.push(response.data.user);
          }
        } catch (error) {
          console.error(
            `Failed to fetch user data for comment like ID ${commentLikes[i]}:`,
            error
          );
        }
      }

      return {
        users: likedUsers,
        hasMore: endIndex < commentLikes.length,
      };
    } catch (error) {
      console.error("Error fetching comment likes:", error);
      return { users: [], hasMore: false };
    }
  };

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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    // If today, just show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }

    // Otherwise show full date
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6 max-w-xl">
      <div className="p-4 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigateToProfile(userId)}
        >
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
            {/* {postUser?.firstname && postUser?.lastname && (
              <p className="text-xs text-gray-500">
                {postUser.firstname} {postUser.lastname}
              </p>
            )} */}
            
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
      <div className="w-full h-[500px] sm:h-[500px] bg-gray-100">
        {image ? (
          <img src={image} alt="Post" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
            <p className="text-gray-400">No image</p>
          </div>
        )}
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left side: Like and Comment buttons */}
        <div className="flex space-x-8">
          {/* Like Button Section */}
          <div className="flex flex-col items-center">
            <button onClick={onLike} className="transition-colors">
              {isLiked ? (
                <FaHeart
                  className="text-2xl text-purple-500 filter drop-shadow-lg"
                  style={{
                    filter: "drop-shadow(0 0 3px rgba(147, 51, 234, 0.5))",
                  }}
                />
              ) : (
                <FaRegHeart className="text-2xl text-gray-700 hover:text-purple-500 transition-colors" />
              )}
            </button>
            {/* Likes count button, clearly separated from like button */}
            <button
              onClick={() => likes.length > 0 && setIsLikesModalOpen(true)}
              className={`mt-1 text-sm ${
                likes.length > 0
                  ? "cursor-pointer hover:text-purple-500 hover:underline"
                  : "cursor-default"
              } ${isLiked ? "text-purple-500" : "text-gray-700"}`}
            >
              {likes.length} {likes.length === 1 ? "like" : "likes"}
            </button>
          </div>

          {/* Comment Button Section */}
          <div className="flex flex-col items-center">
            <button
              className="transition-colors text-gray-700 hover:text-blue-500"
              onClick={() => setShowAllComments(!showAllComments)}
            >
              <FaRegComment className="text-2xl" />
            </button>
            <span className="mt-1 text-sm text-gray-700">
              {localComments.length}{" "}
              {localComments.length === 1 ? "comment" : "comments"}
            </span>
          </div>
        </div>

        {/* Right side: Save button - cu gradient îmbunătățit */}
        <div className="flex flex-col items-center -mt-6">
          <button onClick={handleSavePost} className="transition-colors">
            {localSaved ? (
              <FaBookmark
                className="text-2xl"
                style={{
                  color: "#f59e0b", // Culoare de bază portocalie
                  filter: "drop-shadow(0 0 3px rgba(245, 158, 11, 0.5))",
                  background: "linear-gradient(to right, #f59e0b, #ef4444)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              />
            ) : (
              <FaRegBookmark className="text-2xl text-gray-700 hover:text-yellow-500 transition-colors" />
            )}
          </button>
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="flex">
          <h4
            className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
            onClick={() => navigateToProfile(userId)}
          >
            {postUser?.username || "Unknown User"}
          </h4>
          <p className="text-gray-800 ml-2">{desc}</p>
        </div>
      </div>

      {localComments.length > 0 && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3">
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {/* Display comments */}
            {(showAllComments ? localComments : localComments.slice(0, 1)).map(
              (comment, index) => (
                <div key={comment._id || index} className="mb-3">
                  {/* Main comment */}
                  <div className="flex">
                    <div
                      className="w-8 h-8 rounded-full overflow-hidden mr-2 cursor-pointer"
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
                      <div className="bg-gray-100 rounded-lg p-2 relative">
                        <p
                          className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                          onClick={() => navigateToProfile(comment.userId)}
                        >
                          {commentUsers[comment.userId]?.username ||
                            "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-700">{comment.text}</p>

                        {/* Delete button for own comments */}
                        {currentUser && currentUser._id === comment.userId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Implement delete comment functionality here
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this comment?"
                                )
                              ) {
                                // Remove comment from local state first
                                setLocalComments(
                                  localComments.filter(
                                    (c) => c._id !== comment._id
                                  )
                                );
                                // Then call API to delete from server
                                // deleteComment(_id, comment._id, currentUser._id);
                                // You'll need to implement this API call
                              }
                            }}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center mt-1 text-xs space-x-4">
                        <span className="text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>

                        {/* Like comment button - with fixed count text */}
                        <button
                          className="flex items-center text-gray-500 hover:text-purple-500"
                          onClick={() =>
                            comment._id && handleLikeComment(comment._id)
                          }
                        >
                          {comment.likes &&
                          comment.likes.includes(currentUser?._id || "") ? (
                            <FaHeart
                              className="text-purple-500 mr-1"
                              size={12}
                            />
                          ) : (
                            <FaRegHeart className="mr-1" size={12} />
                          )}
                          <span
                            className={`${
                              comment.likes && comment.likes.length > 0
                                ? "cursor-pointer hover:text-purple-500 hover:underline"
                                : ""
                            } ${
                              comment.likes &&
                              comment.likes.includes(currentUser?._id || "")
                                ? "text-purple-500"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                comment._id &&
                                comment.likes &&
                                comment.likes.length > 0
                              ) {
                                setIsCommentLikesModalOpen(comment._id);
                                setActiveCommentId(comment._id);
                              }
                            }}
                          >
                            {comment.likes?.length || 0}{" "}
                            {(comment.likes?.length || 0) === 1
                              ? "like"
                              : "likes"}
                          </span>
                        </button>

                        {/* Reply to comment button */}
                        <button
                          className="flex items-center text-gray-500 hover:text-blue-500"
                          onClick={() => {
                            setReplyingTo(
                              replyingTo === comment._id
                                ? null
                                : comment._id || null
                            );
                            setReplyText("");
                          }}
                        >
                          <FaReply className="mr-1" size={12} />
                          Reply
                        </button>
                      </div>

                      {/* Reply form */}
                      {replyingTo === comment._id && (
                        <form
                          className="mt-2 flex items-center"
                          onSubmit={handleReply}
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                            {currentUser?.profilePicture ? (
                              <img
                                src={currentUser.profilePicture}
                                alt="Your profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {currentUser?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </span>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${
                              commentUsers[comment.userId]?.username || "user"
                            }...`}
                            className="flex-1 border text-gray-500 border-gray-300 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className={`ml-2 text-blue-500 ${
                              !replyText.trim()
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:text-blue-600"
                            }`}
                          >
                            <FaRegPaperPlane size={14} />
                          </button>
                        </form>
                      )}

                      {/* Display replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-6 mt-2 space-y-2">
                          {comment.replies.map((reply, replyIndex) => (
                            <div
                              key={
                                reply._id ||
                                `${comment._id}-reply-${replyIndex}`
                              }
                              className="flex"
                            >
                              <div
                                className="w-6 h-6 rounded-full overflow-hidden mr-2 cursor-pointer"
                                onClick={() => navigateToProfile(reply.userId)}
                              >
                                {commentUsers[reply.userId]?.profilePicture ? (
                                  <img
                                    src={
                                      commentUsers[reply.userId].profilePicture
                                    }
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      {commentUsers[reply.userId]?.username
                                        ?.charAt(0)
                                        .toUpperCase() || "?"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-lg p-2 relative">
                                  <p
                                    className="text-xs font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                                    onClick={() =>
                                      navigateToProfile(reply.userId)
                                    }
                                  >
                                    {commentUsers[reply.userId]?.username ||
                                      "Unknown User"}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    {reply.text}
                                  </p>

                                  {/* Delete button for own replies */}
                                  {currentUser &&
                                    currentUser._id === reply.userId && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (
                                            window.confirm(
                                              "Are you sure you want to delete this reply?"
                                            )
                                          ) {
                                            // Update in local state first
                                            const updatedComments = [
                                              ...localComments,
                                            ];
                                            const commentIndex =
                                              updatedComments.findIndex(
                                                (c) => c._id === comment._id
                                              );
                                            if (
                                              commentIndex !== -1 &&
                                              updatedComments[commentIndex]
                                                .replies
                                            ) {
                                              updatedComments[
                                                commentIndex
                                              ].replies = updatedComments[
                                                commentIndex
                                              ].replies!.filter(
                                                (r) => r._id !== reply._id
                                              );
                                              setLocalComments(updatedComments);
                                            }
                                            // Then call API to delete from server
                                            // deleteReply(_id, comment._id, reply._id, currentUser._id);
                                            // You'll need to implement this API call
                                          }
                                        }}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                      >
                                        <FaTrash size={10} />
                                      </button>
                                    )}
                                </div>
                                <div className="flex items-center mt-1 text-xs space-x-4">
                                  <span className="text-gray-500">
                                    {formatDate(reply.createdAt)}
                                  </span>

                                  {/* Like reply button - with fixed count display */}
                                  <button
                                    className="flex items-center text-gray-500 hover:text-purple-500"
                                    onClick={() => {
                                      if (comment._id && reply._id) {
                                        handleLikeReply(comment._id, reply._id);
                                      }
                                    }}
                                  >
                                    {reply.likes &&
                                    reply.likes.includes(
                                      currentUser?._id || ""
                                    ) ? (
                                      <FaHeart
                                        className="text-purple-500 mr-1"
                                        size={10}
                                      />
                                    ) : (
                                      <FaRegHeart className="mr-1" size={10} />
                                    )}
                                    <span
                                      className={`${
                                        reply.likes &&
                                        reply.likes.includes(
                                          currentUser?._id || ""
                                        )
                                          ? "text-purple-500"
                                          : ""
                                      }`}
                                    >
                                      {reply.likes?.length || 0}{" "}
                                      {(reply.likes?.length || 0) === 1
                                        ? "like"
                                        : "likes"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          {localComments.length > 1 && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-blue-500 hover:text-blue-700 text-sm mt-2 transition-colors"
            >
              {showAllComments
                ? "Show less"
                : `View all ${localComments.length} comments`}
            </button>
          )}
        </div>
      )}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <form className="flex items-center" onSubmit={handleAddComment}>
          <div
            className="w-8 h-8 rounded-full overflow-hidden mr-2 cursor-pointer"
            onClick={() => currentUser && navigateToProfile(currentUser._id)}
          >
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
            <FaRegPaperPlane size={16} />
          </button>
        </form>
      </div>

      {/* User List Modal for Likes */}
      <UserListModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        title="Likes"
        fetchUsers={fetchLikes}
        postId={_id}
      />

      {/* User List Modal for Comment Likes */}
      {isCommentLikesModalOpen && activeCommentId && (
        <UserListModal
          isOpen={!!isCommentLikesModalOpen}
          onClose={() => {
            setIsCommentLikesModalOpen(null);
            setActiveCommentId(null);
          }}
          title="Comment Likes"
          fetchUsers={(page, limit) =>
            fetchCommentLikes(activeCommentId, page, limit)
          }
          postId={_id}
        />
      )}
    </div>
  );
};

export default PostCard;