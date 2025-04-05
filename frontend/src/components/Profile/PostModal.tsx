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
  FaReply,
  FaRegPaperPlane,
} from "react-icons/fa";
import axios from "axios";
import UserListModal from "../UserListModal"; // Adjust the import path as needed

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
  const { addComment, replyToComment } = usePostStore();
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
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);

  // Initialize state
  useEffect(() => {
    if (post && currentUser) {
      console.log("PostModal post.likes:", post.likes); // Debug: Check post.likes
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
    setIsSaved(!isSaved);
    if (onSave) {
      try {
        await onSave(post._id);
      } catch (error) {
        setIsSaved(isSaved);
        console.error("Error saving post:", error);
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?._id || !currentUser?._id || !commentText.trim()) return;

    const newComment: IComment = {
      _id: `temp-${Date.now()}`,
      userId: currentUser._id,
      text: commentText,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setLocalComments([...localComments, newComment]);
    setCommentText("");

    try {
      await addComment(post._id, currentUser._id, commentText);
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
      setLocalComments(localComments);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?._id || !currentUser?._id || !replyText.trim() || !replyingTo)
      return;

    const commentIndex = localComments.findIndex((c) => c._id === replyingTo);
    if (commentIndex === -1) return;

    const newReply: IComment = {
      _id: `temp-reply-${Date.now()}`,
      userId: currentUser._id,
      text: replyText,
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
      await replyToComment(post._id, replyingTo, currentUser._id, replyText);
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
      setLocalComments(localComments);
    }
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  // Format date like in PostCard
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Just now";

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

  // Handle opening UserListModal
  const handleOpenUserListModal = () => {
    console.log("Opening UserListModal with likes:", post?.likes); // Debug: Check likes before opening
    if (post?.likes && post.likes.length > 0) {
      setIsUserListModalOpen(true);
    } else {
      console.warn("No likes to display in UserListModal");
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
            className="absolute top-4 right-4 text-white bg-gray-900 bg-opacity-50 rounded-full p-2 z-10 hover:bg-opacity-70 transition-colors"
          >
            <FaTimes size={20} />
          </button>

          {/* Left side - Image */}
          <div className="w-[625px] h-[625px] flex-shrink-0">
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
          </div>

          {/* Right side - Post details and comments */}
          <div className="w-[350px] h-[625px] flex flex-col">
            {/* Post author header with description */}
            <div className="p-4 border-b">
              <div className="flex items-start">
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
                <div className="ml-3 flex-1">
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      post.userId && navigateToProfile(post.userId)
                    }
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
                  <div className="mt-1 flex items-center">
                    <p className="text-xs text-gray-500">
                      {formatDate(post.createdAt)}
                    </p>
                    {post.desc && (
                      <>
                        <span className="text-xs text-gray-500 mx-1">•</span>
                        <p className="text-base font-semibold text-gray-800">
                          {post.desc}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Comments section (scrollable) */}
            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-4">
                {localComments.map((comment, index) => (
                  <div key={comment._id || index} className="flex flex-col">
                    <div className="flex">
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
                        <div className="flex items-center mt-1 text-xs space-x-4">
                          <button
                            className="text-gray-500 hover:text-blue-500 flex items-center"
                            onClick={() =>
                              setReplyingTo(
                                replyingTo === comment._id
                                  ? null
                                  : comment._id || null
                              )
                            }
                          >
                            <FaReply className="mr-1" size={12} />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Reply form */}
                    {replyingTo === comment._id && (
                      <form
                        className="mt-2 flex items-center ml-10"
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

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-10 mt-2 space-y-2">
                        {comment.replies.map((reply, replyIndex) => (
                          <div key={reply._id || replyIndex} className="flex">
                            <div
                              className="h-6 w-6 rounded-full overflow-hidden mr-2 cursor-pointer"
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
                            <div>
                              <p className="text-sm">
                                <span
                                  className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                                  onClick={() =>
                                    navigateToProfile(reply.userId)
                                  }
                                >
                                  {commentUsers[reply.userId]?.username ||
                                    "Unknown User"}
                                </span>{" "}
                                <span className="text-gray-800">
                                  {reply.text}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    onClick={handleOpenUserListModal}
                    className={`mt-1 text-sm ${
                      isLiked ? "text-purple-500" : "text-gray-700"
                    } hover:underline cursor-pointer`}
                    disabled={post.likes.length === 0}
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
              <form className="flex items-center" onSubmit={handleComment}>
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
                  <FaRegPaperPlane size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* UserListModal for likes */}
      {isUserListModalOpen && (
        <UserListModal
          isOpen={isUserListModalOpen}
          onClose={() => setIsUserListModalOpen(false)}
          userIds={post.likes || []} // Ensure userIds is always an array
        />
      )}
    </>
  );
};

export default PostModal;
