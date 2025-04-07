import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const { fetchPostsByTag, tagPosts, loading, error, likePost, savePost } =
    usePostStore();

  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);

  // Ensure the tag name is properly displayed
  const displayTagName = tagName
    ? tagName.startsWith("#")
      ? tagName.substring(1)
      : tagName
    : "";

  useEffect(() => {
    if (displayTagName) {
      console.log(`TagExplore: Fetching posts for tag "${displayTagName}"`);
      fetchPostsByTag(displayTagName);
    }
  }, [displayTagName, fetchPostsByTag]);

  const handlePostClick = (post: IPost) => {
    setSelectedPost(post);
  };

  const handleLikePost = async (postId: string) => {
    if (user && user._id) {
      await likePost(postId, user._id);
    }
  };

  const handleSavePost = async (postId: string) => {
    if (user && user._id) {
      await savePost(postId, user._id);
    }
  };

  // Funcție goală pentru a preveni comutarea
  const handleViewModeChange = (_mode: "grid" | "list") => {
    // Nu face nimic, păstrăm doar "grid"
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
                <h1 className="text-2xl font-bold text-gray-600">
                  #{displayTagName}
                </h1>
                <p className="text-gray-300">
                  {tagPosts.length} {tagPosts.length === 1 ? "post" : "posts"}
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
          {!loading && !error && tagPosts.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-center">
              <p className="text-white">
                No posts found with tag #{displayTagName}.
              </p>
            </div>
          )}

          {/* Posts Grid */}
          {!loading && !error && tagPosts.length > 0 && (
            <PostGrid
              posts={tagPosts}
              viewMode="grid" // Fixăm modul la "grid"
              onViewModeChange={handleViewModeChange} // Funcție goală
              onPostClick={handlePostClick}
              showViewModeToggle={false} // Ascundem butoanele de comutare
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
