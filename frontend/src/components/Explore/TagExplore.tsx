import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PostGrid from "../Profile/PostGrid";
import PostModal from "../Profile/PostModal";
import { IPost } from "../../types/PostTypes";
import useAuthStore from "../../store/AuthStore";
import usePostStore from "../../store/PostStore";
import Background from "../Home/Background";
import Dashboard from "../Home/Dashboard";

const TagExplore: React.FC = () => {
  const { tagName } = useParams<{ tagName: string }>();
  const { user } = useAuthStore();
  const { likePost, savePost } = usePostStore();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const fetchTagPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5001/post/tag/${encodeURIComponent(tagName || "")}`
        );

        if (response.data.success) {
          setPosts(response.data.posts);
          setPostCount(response.data.posts.length);
        } else {
          setError("Failed to fetch posts for this tag");
        }
      } catch (error) {
        console.error("Error fetching tag posts:", error);
        setError("An error occurred while fetching posts");
      } finally {
        setLoading(false);
      }
    };

    if (tagName) {
      fetchTagPosts();
    }
  }, [tagName]);

  const handlePostClick = (post: IPost) => {
    setSelectedPost(post);
  };

  const handleLikePost = async (postId: string) => {
    if (user && user._id) {
      await likePost(postId, user._id);

      // Update local state
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            const isLiked = post.likes.includes(user._id);
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((id) => id !== user._id)
                : [...post.likes, user._id],
            };
          }
          return post;
        })
      );
    }
  };

  const handleSavePost = async (postId: string) => {
    if (user && user._id) {
      await savePost(postId, user._id);

      // Update local state
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            const savedBy = post.savedBy || [];
            const isSaved = savedBy.includes(user._id);
            return {
              ...post,
              savedBy: isSaved
                ? savedBy.filter((id) => id !== user._id)
                : [...savedBy, user._id],
            };
          }
          return post;
        })
      );
    }
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  return (
    <div className="relative min-h-screen text-white">
      <Background />

      <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
        <div className="max-w-4xl mx-auto">
          {/* Tag Header */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                <span className="text-2xl font-bold">#</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">#{tagName}</h1>
                <p className="text-gray-300">
                  {postCount} {postCount === 1 ? "post" : "posts"}
                </p>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-400/20 text-white p-4 rounded-lg mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* No posts state */}
          {!loading && !error && posts.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-center">
              <p className="text-white">No posts found with this tag.</p>
            </div>
          )}

          {/* Posts Grid */}
          {!loading && !error && posts.length > 0 && (
            <PostGrid
              posts={posts}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onPostClick={handlePostClick}
            />
          )}
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={handleLikePost}
          onSave={handleSavePost}
        />
      )}

      <Dashboard />
    </div>
  );
};

export default TagExplore;
