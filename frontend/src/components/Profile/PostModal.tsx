import React, { useState, useEffect, useRef } from "react";
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
  FaReply,
  FaRegPaperPlane,
  FaMapMarkerAlt,
  FaTrash,
  FaEllipsisV,
} from "react-icons/fa";
import axios from "axios";
import UserListModal from "../UserListModal";
import MentionsInput from "../Home/MentionsInput"; // Adjust path as needed

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
  const {
    addComment,
    replyToComment,
    likeComment,
    likeReply,
    deletePost,
    savePost,
  } = usePostStore();
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showTaggedUsers, setShowTaggedUsers] = useState(false);
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [isCommentLikesModalOpen, setIsCommentLikesModalOpen] = useState<
    string | null
  >(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (!post?.userId) return;
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
  }, [post?.userId]);

  // Fetch comment authors' details
  useEffect(() => {
    const fetchCommentUsers = async () => {
      if (!post?.comments || post.comments.length === 0) return;

      const userIds = new Set<string>();
      post.comments.forEach((comment) => {
        userIds.add(comment.userId);
        if (comment.replies) {
          comment.replies.forEach((reply) => userIds.add(reply.userId));
        }
      });

      const uniqueUserIds = Array.from(userIds);
      const newCommentUsers: Record<
        string,
        { username: string; profilePicture?: string }
      > = { ...commentUsers };

      for (const commentUserId of uniqueUserIds) {
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
  }, [post?.comments]);

  // Handle click outside to close menu
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

  // Parse mentions
  const parseCommentText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@") && part.length > 1) {
        const username = part.substring(1);
        const userId = Object.keys(commentUsers).find(
          (id) => commentUsers[id].username === username
        );
        if (userId) {
          return (
            <span
              key={index}
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => navigateToProfile(userId)}
            >
              {part}
            </span>
          );
        }
        return (
          <span
            key={index}
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={async () => {
              try {
                const response = await axios.get(
                  `http://localhost:5001/user/search?username=${encodeURIComponent(
                    username
                  )}`
                );
                if (response.data.success && response.data.users.length > 0) {
                  const fetchedUser = response.data.users[0];
                  const fetchedUserId = fetchedUser._id;
                  setCommentUsers((prev) => ({
                    ...prev,
                    [fetchedUserId]: {
                      username: fetchedUser.username,
                      profilePicture: fetchedUser.profilePicture,
                    },
                  }));
                  navigateToProfile(fetchedUserId);
                }
              } catch (error) {
                console.error(`Failed to fetch user ${username}:`, error);
              }
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Parse hashtags
  const parseDescription = (text: string) => {
    const parts = text.split(/(#[^\s#]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        const tagName = part.substring(1);
        return (
          <span
            key={index}
            className="text-blue-800 hover:underline cursor-pointer"
            onClick={() =>
              navigate(`/explore/tag/${encodeURIComponent(tagName)}`)
            }
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleLike = async () => {
    if (!post?._id || !currentUser) return;
    setIsLiked(!isLiked);
    if (onLike) {
      try {
        await onLike(post._id);
      } catch (error) {
        setIsLiked(isLiked);
        console.error("Error liking post:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!post?._id || !currentUser) return;
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    try {
      await savePost(post._id, currentUser._id);
    } catch (error) {
      setIsSaved(isSaved);
      console.error("Error saving post:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!post?._id || !currentUser) return;
    try {
      await deletePost(post._id, currentUser._id);
      setShowMenu(false);
      onClose();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?._id || !currentUser?._id || !commentText.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newComment: IComment = {
      _id: tempId,
      userId: currentUser._id,
      text: commentText,
      likes: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setLocalComments([...localComments, newComment]);
    setCommentText("");

    try {
      const response = await addComment(post._id, currentUser._id, commentText);
      // Update temp comment with server ID if available
      if (response._id && response._id !== tempId) {
        setLocalComments((prev) =>
          prev.map((c) => (c._id === tempId ? { ...c, _id: response._id } : c))
        );
      }
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
      setLocalComments(localComments.filter((c) => c._id !== tempId));
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?._id || !currentUser?._id || !replyText.trim() || !replyingTo)
      return;

    const commentIndex = localComments.findIndex((c) => c._id === replyingTo);
    if (commentIndex === -1) return;

    const tempId = `temp-reply-${Date.now()}`;
    const newReply: IComment = {
      _id: tempId,
      userId: currentUser._id,
      text: replyText,
      likes: [],
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...localComments];
    if (!updatedComments[commentIndex].replies) {
      updatedComments[commentIndex].replies = [];
    }
    updatedComments[commentIndex].replies!.push(newReply);
    setLocalComments(updatedComments);
    setReplyText("");
    setReplyingTo(null);

    try {
      const response = await replyToComment(
        post._id,
        replyingTo,
        currentUser._id,
        replyText
      );
      // Update temp reply with server ID if available
      if (response._id && response._id !== tempId) {
        setLocalComments((prev) => {
          const newComments = [...prev];
          newComments[commentIndex].replies = newComments[
            commentIndex
          ].replies!.map((r) =>
            r._id === tempId ? { ...r, _id: response._id } : r
          );
          return newComments;
        });
      }
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
      const fallbackComments = [...localComments];
      if (fallbackComments[commentIndex].replies) {
        fallbackComments[commentIndex].replies = fallbackComments[
          commentIndex
        ].replies!.filter((r) => r._id !== tempId);
      }
      setLocalComments(fallbackComments);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    console.log("handleLikeComment called with commentId:", commentId);
    if (!currentUser?._id || !post?._id || !commentId) {
      console.error("Cannot like comment: missing required IDs", {
        userId: currentUser?._id,
        postId: post?._id,
        commentId,
      });
      return;
    }

    const commentIndex = localComments.findIndex((c) => c._id === commentId);
    if (commentIndex === -1) {
      console.error("Comment not found:", commentId);
      return;
    }

    try {
      console.log("Sending likeComment request:", {
        postId: post._id,
        commentId,
        userId: currentUser._id,
      });
      await likeComment(post._id, commentId, currentUser._id);
      console.log("likeComment API call successful");
      setLocalComments((prevComments) => {
        const updatedComments = [...prevComments];
        if (!updatedComments[commentIndex].likes) {
          updatedComments[commentIndex].likes = [];
        }
        const isLiked = updatedComments[commentIndex].likes!.includes(
          currentUser._id
        );
        if (isLiked) {
          updatedComments[commentIndex].likes = updatedComments[
            commentIndex
          ].likes!.filter((id) => id !== currentUser._id);
        } else {
          updatedComments[commentIndex].likes!.push(currentUser._id);
        }
        console.log(
          "Updated comment likes:",
          updatedComments[commentIndex].likes
        );
        return updatedComments;
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleLikeReply = async (commentId: string, replyId: string) => {
    console.log("handleLikeReply called with:", { commentId, replyId });
    if (!currentUser?._id || !post?._id) return;

    const commentIndex = localComments.findIndex((c) => c._id === commentId);
    if (commentIndex === -1 || !localComments[commentIndex].replies) return;

    const replyIndex = localComments[commentIndex].replies!.findIndex(
      (r) => r._id === replyId
    );
    if (replyIndex === -1) return;

    try {
      await likeReply(post._id, commentId, replyId, currentUser._id);
      setLocalComments((prevComments) => {
        const updatedComments = [...prevComments];
        if (!updatedComments[commentIndex].replies![replyIndex].likes) {
          updatedComments[commentIndex].replies![replyIndex].likes = [];
        }
        const isLiked = updatedComments[commentIndex].replies![
          replyIndex
        ].likes!.includes(currentUser._id);
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
        return updatedComments;
      });
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  const handleImageClick = () => {
    if (post?.taggedUsers && post.taggedUsers.length > 0) {
      setShowTaggedUsers(!showTaggedUsers);
    }
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    return date.toLocaleDateString();
  };

  const fetchLikes = async (page: number, limit: number) => {
    try {
      const likedUsers = [];
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, post?.likes.length || 0);
      for (let i = startIndex; i < endIndex; i++) {
        if (i >= (post?.likes.length || 0)) break;
        try {
          const response = await axios.get(
            `http://localhost:5001/user/${post?.likes[i]}`
          );
          if (response.data.success) {
            likedUsers.push(response.data.user);
          }
        } catch (error) {
          console.error(
            `Failed to fetch user data for like ID ${post?.likes[i]}:`,
            error
          );
        }
      }
      return {
        users: likedUsers,
        hasMore: endIndex < (post?.likes.length || 0),
      };
    } catch (error) {
      console.error("Error fetching likes:", error);
      return { users: [], hasMore: false };
    }
  };

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

  if (!post) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 flex items-center justify-center">
        <div className="relative w-[975px] h-[625px] flex bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-gray-900 bg-opacity-50 rounded-full p-2 z-20 hover:bg-opacity-70 transition-colors"
          >
            <FaTimes size={20} />
          </button>

          {/* Left side - Image with tagged users */}
          <div
            className="w-[625px] h-[625px] flex-shrink-0 relative z-10"
            onClick={handleImageClick}
          >
            {post.image ? (
              <img
                src={post.image}
                alt="Post"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                <p className="text-gray-600">No image</p>
              </div>
            )}
            {post.taggedUsers &&
              post.taggedUsers.length > 0 &&
              !showTaggedUsers && (
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center z-20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  {post.taggedUsers.length}
                </div>
              )}
            {showTaggedUsers &&
              post.taggedUsers &&
              post.taggedUsers.map((taggedUser, index) => (
                <div
                  key={index}
                  className="absolute w-3 h-3 rounded-full bg-blue-500/70 border-2 border-white transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-20"
                  style={{
                    left: `${taggedUser.position.x}%`,
                    top: `${taggedUser.position.y}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile(taggedUser.userId);
                  }}
                >
                  <div className="absolute whitespace-nowrap bg-black/80 rounded-lg px-2 py-1 text-xs left-full ml-1 z-30">
                    <span
                      className="text-white hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToProfile(taggedUser.userId);
                      }}
                    >
                      {taggedUser.username}
                    </span>
                  </div>
                </div>
              ))}
            {post.taggedUsers && post.taggedUsers.length > 0 && (
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4 z-10"
                onClick={handleImageClick}
              >
                <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  {showTaggedUsers
                    ? "Click to hide tags"
                    : "Click to view tags"}
                </p>
              </div>
            )}
          </div>

          {/* Right side - Post details and comments */}
          <div className="w-[350px] h-[625px] flex flex-col">
            {/* Post author header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => post.userId && navigateToProfile(post.userId)}
              >
                <div className="h-10 w-10 rounded-full overflow-hidden">
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
                  {post.location?.name && (
                    <div
                      className="text-xs text-gray-500 flex items-center cursor-pointer hover:text-blue-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/explore/location/${encodeURIComponent(
                            post.location!.name
                          )}`,
                          {
                            state: { coordinates: post.location?.coordinates },
                          }
                        );
                        onClose();
                      }}
                    >
                      <FaMapMarkerAlt className="mr-1" size={10} />
                      {post.location.name}
                    </div>
                  )}
                </div>
              </div>
              {currentUser &&
                (currentUser._id === post.userId ||
                  currentUser.role === "admin") && (
                  <div className="relative" ref={menuRef}>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <FaEllipsisV />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
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

            {/* Description */}
            {post.desc && (
              <div className="px-4 py-2 border-b">
                <div className="flex">
                  <h4
                    className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                    onClick={() =>
                      post.userId && navigateToProfile(post.userId)
                    }
                  >
                    {postUser?.username || "Unknown User"}
                  </h4>
                  <p className="text-gray-800 ml-2">
                    {parseDescription(post.desc)}
                  </p>
                </div>
              </div>
            )}

            {/* Comments section */}
            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-4">
                {localComments.map((comment, index) => (
                  <div
                    key={comment._id || `comment-${index}`}
                    className="flex flex-col"
                  >
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
                          <p className="text-sm text-gray-700">
                            {parseCommentText(comment.text)}
                          </p>
                          {currentUser &&
                            currentUser._id === comment.userId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this comment?"
                                    )
                                  ) {
                                    setLocalComments(
                                      localComments.filter(
                                        (c) => c._id !== comment._id
                                      )
                                    );
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
                          <div className="flex items-center space-x-1">
                            <button
                              className="flex items-center text-gray-500 hover:text-purple-500 focus:outline-none p-1 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Comment heart clicked:", {
                                  commentId: comment._id,
                                  userId: currentUser?._id,
                                  postId: post._id,
                                });
                                if (
                                  comment._id &&
                                  currentUser?._id &&
                                  post._id
                                ) {
                                  handleLikeComment(comment._id);
                                } else {
                                  console.error(
                                    "Cannot like comment - missing data:",
                                    {
                                      commentId: comment._id,
                                      userId: currentUser?._id,
                                      postId: post._id,
                                    }
                                  );
                                }
                              }}
                              disabled={
                                !comment._id || !currentUser?._id || !post._id
                              }
                              title={
                                comment._id
                                  ? "Like comment"
                                  : "Cannot like comment"
                              }
                            >
                              {comment.likes?.includes(
                                currentUser?._id || ""
                              ) ? (
                                <FaHeart
                                  className="text-purple-500 mr-1"
                                  size={12}
                                />
                              ) : (
                                <FaRegHeart
                                  className="text-gray-500 hover:text-purple-500 mr-1"
                                  size={12}
                                />
                              )}
                            </button>
                            <span
                              className={`${
                                comment.likes && comment.likes.length > 0
                                  ? "cursor-pointer hover:text-purple-500 hover:underline"
                                  : "cursor-default text-gray-500"
                              } ${
                                comment.likes?.includes(currentUser?._id || "")
                                  ? "text-purple-500"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "Comment likes count clicked:",
                                  comment._id
                                );
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
                          </div>
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
                        {comment.replies && comment.replies.length > 0 && (
                          <button
                            onClick={() =>
                              setShowReplies((prev) => ({
                                ...prev,
                                [comment._id!]: !prev[comment._id!],
                              }))
                            }
                            className="text-blue-500 hover:text-blue-700 text-xs mt-1"
                          >
                            {showReplies[comment._id!]
                              ? "Hide replies"
                              : `View ${comment.replies.length} ${
                                  comment.replies.length === 1
                                    ? "reply"
                                    : "replies"
                                }`}
                          </button>
                        )}
                        {replyingTo === comment._id && (
                          <MentionsInput
                            value={replyText}
                            onChange={setReplyText}
                            placeholder={`Reply to ${
                              commentUsers[comment.userId]?.username || "user"
                            }...`}
                            onSubmit={handleReply}
                            className="border border-gray-300 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                          />
                        )}
                        {showReplies[comment._id!] &&
                          comment.replies &&
                          comment.replies.length > 0 && (
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
                                    onClick={() =>
                                      navigateToProfile(reply.userId)
                                    }
                                  >
                                    {commentUsers[reply.userId]
                                      ?.profilePicture ? (
                                      <img
                                        src={
                                          commentUsers[reply.userId]
                                            .profilePicture
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
                                        {parseCommentText(reply.text)}
                                      </p>
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
                                                  setLocalComments(
                                                    updatedComments
                                                  );
                                                }
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
                                      <button
                                        className="flex items-center text-gray-500 hover:text-purple-500"
                                        onClick={() => {
                                          if (comment._id && reply._id) {
                                            handleLikeReply(
                                              comment._id,
                                              reply._id
                                            );
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
                                          <FaRegHeart
                                            className="mr-1"
                                            size={10}
                                          />
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
                ))}
              </div>
            </div>

            {/* Actions section */}
            <div className="p-4 border-t flex justify-between items-center">
              <div className="flex space-x-8">
                <div className="flex flex-col items-center">
                  <button onClick={handleLike} className="transition-colors">
                    {isLiked ? (
                      <FaHeart
                        className="text-2xl text-purple-500 filter drop-shadow-lg"
                        style={{
                          filter:
                            "drop-shadow(0 0 3px rgba(147, 51, 234, 0.5))",
                        }}
                      />
                    ) : (
                      <FaRegHeart className="text-2xl text-gray-700 hover:text-purple-500 transition-colors" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      post.likes.length > 0 && setIsLikesModalOpen(true)
                    }
                    className={`mt-1 text-sm ${
                      post.likes.length > 0
                        ? "cursor-pointer hover:text-purple-500 hover:underline"
                        : "cursor-default"
                    } ${isLiked ? "text-purple-500" : "text-gray-700"}`}
                  >
                    {post.likes.length}{" "}
                    {post.likes.length === 1 ? "like" : "likes"}
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <button className="transition-colors text-gray-700 hover:text-blue-500">
                    <FaRegComment className="text-2xl" />
                  </button>
                  <span className="mt-1 text-sm text-gray-700">
                    {localComments.length}{" "}
                    {localComments.length === 1 ? "comment" : "comments"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <button onClick={handleSave} className="transition-colors">
                  {isSaved ? (
                    <FaBookmark
                      className="text-2xl"
                      style={{
                        color: "#f59e0b",
                        filter: "drop-shadow(0 0 3px rgba(245, 158, 11, 0.5))",
                        background:
                          "linear-gradient(to right, #f59e0b, #ef4444)",
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

            {/* Add comment section */}
            <div className="p-4 border-t">
              <MentionsInput
                value={commentText}
                onChange={setCommentText}
                placeholder="Add a comment..."
                onSubmit={handleComment}
                className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserListModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        title="Likes"
        fetchUsers={fetchLikes}
        postId={post._id}
      />
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
          postId={post._id}
        />
      )}
    </>
  );
};

export default PostModal;
