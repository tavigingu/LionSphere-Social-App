import { FaHeart, FaRegHeart, FaComment, FaShare } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { IPost } from "../types/PostTypes";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
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
  const { addComment } = usePostStore();
  const [postUser, setPostUser] = useState<{
    profilePicture?: string;
    username: string;
    firstname?: string;
    lastname?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5001/user/${userId}`
        );
        if (response.data.success) {
          setPostUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Fetch comment users data
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
  }, [comments]);
  return (
    <div
      className={`w-full max-w-md sm:max-w-lg lg:max-w-xl ${
        comments.length > 0
          ? "min-h-[600px] sm:min-h-[700px] lg:min-h-[850px]"
          : "min-h-[460px] sm:min-h-[560px] lg:min-h-[680px]"
      } lg:min-w-[750px] backdrop-blur-sm bg-white/5 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl flex flex-col`}
    >
      {/* Header cu username-ul și imaginea utilizatorului care postează */}
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-green-500 flex items-center justify-center mr-3 overflow-hidden">
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
        <div className="flex flex-col">
          <span className="text-white font-medium text-base sm:text-lg">
            {postUser?.username || "Unknown User"}
          </span>
          {postUser?.firstname && postUser?.lastname && (
            <span className="text-gray-400 text-xs">
              {postUser.firstname} {postUser.lastname}
            </span>
          )}
        </div>
      </div>

      {/* Imaginea principală a postării - înălțime fixă indiferent de comentarii */}
      <div className="h-[300px] sm:h-[350px] lg:h-[450px] relative mb-4">
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
        <button
          className="flex items-center text-gray-300 hover:text-blue-500 transition-colors"
          onClick={() => setShowAllComments(!showAllComments)}
        >
          <FaComment className="mr-2 size-4 sm:size-5" />
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </button>
        <button className="flex items-center text-gray-300 hover:text-green-500 transition-colors">
          <FaShare className="mr-2 size-4 sm:size-5" /> Share
        </button>
      </div>

      {/* Descrierea */}
      <div>
        <p className="text-gray-300 text-sm sm:text-base mb-4">{desc}</p>
      </div>

      {/* Comments section - displayed only if there are comments */}
      {comments.length > 0 && (
        <div className="mt-2 mb-6 border-t border-gray-700 pt-3">
          <h4 className="text-gray-300 text-sm font-medium mb-2">
            Comments ({comments.length})
          </h4>

          {/* Display first comment or all comments based on state */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {(showAllComments ? comments : comments.slice(0, 1)).map(
              (comment, index) => (
                <div key={comment._id || index} className="flex items-start">
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2">
                    {commentUsers[comment.userId]?.profilePicture ? (
                      <img
                        src={commentUsers[comment.userId].profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {commentUsers[comment.userId]?.username
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      <p className="text-white text-sm font-medium">
                        {commentUsers[comment.userId]?.username ||
                          "Unknown User"}
                      </p>
                      <p className="text-gray-300 text-sm">{comment.text}</p>
                    </div>
                    {comment.createdAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* View more button - show only if there are more than 1 comment */}
          {comments.length > 1 && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
            >
              {showAllComments
                ? "Show less"
                : `View all ${comments.length} comments`}
            </button>
          )}
        </div>
      )}

      {/* Comment input section */}
      <div
        className={`mt-auto ${comments.length > 0 ? "pt-4" : "pt-16"} ${
          comments.length === 0 ? "border-t border-gray-700" : ""
        }`}
      >
        <div className="flex">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 overflow-hidden">
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
          <form
            className="flex-1 flex"
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim() && currentUser?._id && _id) {
                addComment(_id, currentUser._id, commentText)
                  .then(() => {
                    setCommentText("");
                    // După adăugarea unui comentariu, ar fi bine să actualizăm și datele utilizatorului
                    if (!commentUsers[currentUser._id]) {
                      setCommentUsers({
                        ...commentUsers,
                        [currentUser._id]: {
                          username: currentUser.username,
                          profilePicture: currentUser.profilePicture,
                        },
                      });
                    }
                    // Afișăm toate comentariile după ce adăugăm unul nou
                    setShowAllComments(true);
                  })
                  .catch((error) =>
                    console.error("Error adding comment:", error)
                  );
              }
            }}
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Scrie un comentariu..."
              className="flex-1 bg-transparent border-b border-gray-700 focus:border-blue-500 px-2 py-1 text-white text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`ml-2 px-3 py-1 rounded-lg ${
                commentText.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              } text-sm transition-colors`}
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
