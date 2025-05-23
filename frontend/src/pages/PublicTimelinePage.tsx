// frontend/src/pages/PublicTimelinePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../components/Home/Background";
import PostCard from "../components/Home/PostCard";
import SearchSidebar from "../components/Home/SearchSidebar";
import axios from "axios";
import { IPost } from "../types/PostTypes";
import { FaSearch, FaUsers, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import FullLogo from "../assets/LionSphere_longlogo.png";
import TimelineSearch from "../components/Home/TimelineSearch";

const PublicTimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptType, setPromptType] = useState<"like" | "comment" | "save">(
    "like"
  );

  useEffect(() => {
    fetchPublicPosts();
  }, []);

  const fetchPublicPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get public posts - in production, you'd need a dedicated endpoint
      // For now, we'll fetch timeline posts without authentication
      const response = await axios.get("http://localhost:5001/post/popular", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const publicPosts = response.data.posts || [];
        setPosts(publicPosts);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      setError("Error fetching posts");
      console.error("Error:", err);
      // For demo, let's try getting timeline posts without auth
      try {
        const fallbackResponse = await axios.get(
          `http://localhost:5001/post/demo/timeline`
        );
        if (fallbackResponse.data.posts) {
          setPosts(fallbackResponse.data.posts.slice(0, 10)); // Show first 10 posts
        }
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionAttempt = (type: "like" | "comment" | "save") => {
    setPromptType(type);
    setShowLoginPrompt(true);
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleRegisterRedirect = () => {
    navigate("/login", { state: { isRegister: true } });
  };

  return (
    <div className="relative min-h-screen text-white">
      <Background />

      {/* Header */}
      <div className="relative z-10 backdrop-blur-md bg-white/10 shadow-lg fixed top-0 left-0 right-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src={FullLogo}
                alt="LionSphere Logo"
                className="h-10 w-auto object-contain cursor-pointer"
                onClick={() => navigate("/")}
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Search"
              >
                <FaSearch className="text-gray-800 h-5 w-5" />
              </button>

              <button
                onClick={handleLoginRedirect}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                <FaSignInAlt />
                Log In
              </button>

              <button
                onClick={handleRegisterRedirect}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
              >
                <FaUserPlus />
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pt-20 pb-8 relative z-10">
        <div className="max-w-xl mx-auto">
          {/* Welcome banner */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to LionSphere
            </h1>
            <p className="text-gray-600 mb-4">
              Discover the latest posts from our community. Join us to interact
              and share!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLoginRedirect}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                Sign In to Continue
              </button>
              <button
                onClick={handleRegisterRedirect}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Posts section */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && !loading && posts.length === 0 && (
            <div className="bg-red-400 bg-opacity-20 text-white p-4 rounded-lg mb-8 text-center">
              <p>Error loading posts: {error}</p>
              <button
                onClick={fetchPublicPosts}
                className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Try Again
              </button>
            </div>
          )}

          {posts.length === 0 && !loading && (
            <div className="text-center p-8 backdrop-blur-sm bg-white/5 rounded-xl">
              <FaUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg text-gray-300">No posts available</p>
              <p className="text-gray-400 mt-2">
                Check back later or join our community!
              </p>
            </div>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                _id={post._id || ""}
                userId={post.userId}
                desc={post.desc}
                likes={post.likes || []}
                savedBy={post.savedBy || []}
                image={post.image}
                location={post.location}
                taggedUsers={post.taggedUsers}
                comments={post.comments || []}
                onLike={() => handleInteractionAttempt("like")}
                onSave={() => handleInteractionAttempt("save")}
                isLiked={false}
                isSaved={false}
                isReadOnly={true} // Custom prop to indicate read-only mode
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 border-t border-gray-300/30 pt-8">
            <div className="px-3 text-center">
              <div className="flex flex-wrap gap-1 text-xs text-gray-400 justify-center">
                <a href="/about" className="hover:underline">
                  About
                </a>
                <span>·</span>
                <a href="/privacy" className="hover:underline">
                  Privacy Policy
                </a>
                <span>·</span>
                <a href="/terms" className="hover:underline">
                  Terms of Service
                </a>
                <span>·</span>
                <a href="/contact" className="hover:underline">
                  Contact
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                © 2025 LIONSHPERE BY TAVI GINGU
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Sidebar */}
      <TimelineSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Join LionSphere
            </h3>
            <p className="text-gray-600 mb-6">
              {promptType === "like" && "Like posts from our community! "}
              {promptType === "comment" && "Share your thoughts! "}
              {promptType === "save" && "Save posts for later! "}
              Sign in to continue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLoginRedirect}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Log In
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={handleRegisterRedirect}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTimelinePage;
