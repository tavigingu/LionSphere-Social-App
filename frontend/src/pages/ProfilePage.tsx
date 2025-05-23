import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import useStoryStore from "../store/StoryStore";
import Background from "../components/Home/Background";
import PostCard from "../components/Home/PostCard";
import Dashboard from "../components/Home/Dashboard";
import ProfileHeader from "../components/Profile/ProfileHeader";
import UserInfoSidebar from "../components/Profile/UserInfoSide";
import PostGrid from "../components/Profile/PostGrid";
import PostModal from "../components/Profile/PostModal";
import StoryViewer from "../components/Home/StoryViewer";
import { IUser } from "../types/AuthTypes";
import { IPost } from "../types/PostTypes";
import { followUser, unfollowUser, checkFollowStatus } from "../api/User";
import { motion } from "framer-motion";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const {
    likePost: likeSinglePost,
    savePost: savePostFunction,
    fetchSavedPosts,
    fetchUserPosts,
    fetchTaggedPosts,
    taggedPosts,
  } = usePostStore();
  const { storyGroups, fetchStories, setActiveStoryGroup } = useStoryStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileUser, setProfileUser] = useState<IUser | null>(null);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<IPost[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "tagged">(
    "posts"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const isOwnProfile = currentUser?._id === (userId || currentUser?._id);
  const targetUserId = userId || currentUser?._id;
  const postCount = userPosts.length;

  // Handle activeTab from navigation state
  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      const newTab = (location.state as any).activeTab as
        | "posts"
        | "saved"
        | "tagged";
      setActiveTab(newTab);
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchProfileData = useCallback(async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      const userResponse = await axios.get(
        `http://localhost:5001/user/${targetUserId}`
      );
      if (userResponse.data.success) {
        const userData = userResponse.data.user;
        setProfileUser(userData);

        if (currentUser && !isOwnProfile) {
          setIsFollowing(checkFollowStatus(userData, currentUser._id));
        }

        const postsResponse = await axios.get(
          `http://localhost:5001/post/${targetUserId}/posts`
        );
        if (postsResponse.data.success) {
          const userPosts = postsResponse.data.posts.filter(
            (post: IPost) => post.userId === targetUserId
          );
          setUserPosts(userPosts);
        }

        if (isOwnProfile && currentUser) {
          await fetchSavedPosts(currentUser._id);
          setSavedPosts(usePostStore.getState().savedPosts);
        }

        await fetchTaggedPosts(targetUserId);
        await fetchStories(targetUserId);
      } else {
        setError("Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("An error occurred while fetching profile data");
    } finally {
      setLoading(false);
    }
  }, [
    targetUserId,
    currentUser,
    isOwnProfile,
    fetchSavedPosts,
    fetchTaggedPosts,
    fetchStories,
  ]);

  useEffect(() => {
    if (!targetUserId) {
      navigate("/login");
      return;
    }
    fetchProfileData();
  }, [targetUserId, navigate, fetchProfileData]);

  const refreshSavedPosts = useCallback(async () => {
    if (currentUser && isOwnProfile) {
      try {
        await fetchSavedPosts(currentUser._id);
        setSavedPosts(usePostStore.getState().savedPosts);
      } catch (err) {
        console.error("Error refreshing saved posts:", err);
      }
    }
  }, [currentUser, isOwnProfile, fetchSavedPosts]);

  const handleLikePost = useCallback(
    async (postId: string) => {
      if (currentUser && currentUser._id) {
        await likeSinglePost(postId, currentUser._id);
        const updatePostsWithLike = (posts: IPost[]) =>
          posts.map((post) => {
            if (post._id === postId) {
              const isLiked = post.likes.includes(currentUser._id);
              return {
                ...post,
                likes: isLiked
                  ? post.likes.filter((id) => id !== currentUser._id)
                  : [...post.likes, currentUser._id],
              };
            }
            return post;
          });

        if (activeTab === "posts") {
          setUserPosts(updatePostsWithLike(userPosts));
        } else if (activeTab === "saved") {
          setSavedPosts(updatePostsWithLike(savedPosts));
        }

        if (selectedPost && selectedPost._id === postId) {
          const isLiked = selectedPost.likes.includes(currentUser._id);
          setSelectedPost({
            ...selectedPost,
            likes: isLiked
              ? selectedPost.likes.filter((id) => id !== currentUser._id)
              : [...selectedPost.likes, currentUser._id],
          });
        }
      }
    },
    [
      currentUser,
      likeSinglePost,
      activeTab,
      userPosts,
      savedPosts,
      selectedPost,
    ]
  );

  const handleSavePost = useCallback(
    async (postId: string) => {
      if (currentUser && currentUser._id) {
        await savePostFunction(postId, currentUser._id);
        if (activeTab === "posts") {
          const updatedPosts = userPosts.map((post) => {
            if (post._id === postId) {
              const isSaved = post.savedBy?.includes(currentUser._id);
              return {
                ...post,
                savedBy: isSaved
                  ? (post.savedBy || []).filter((id) => id !== currentUser._id)
                  : [...(post.savedBy || []), currentUser._id],
              };
            }
            return post;
          });
          setUserPosts(updatedPosts);
        } else if (activeTab === "saved") {
          const post = savedPosts.find((p) => p._id === postId);
          if (post) {
            const isSaved = post.savedBy?.includes(currentUser._id);
            if (isSaved) {
              setSavedPosts(savedPosts.filter((p) => p._id !== postId));
            } else {
              const updatedPosts = savedPosts.map((p) => {
                if (p._id === postId) {
                  return {
                    ...p,
                    savedBy: [...(p.savedBy || []), currentUser._id],
                  };
                }
                return p;
              });
              setSavedPosts(updatedPosts);
            }
          }
        }

        if (selectedPost && selectedPost._id === postId) {
          const isSaved = selectedPost.savedBy?.includes(currentUser._id);
          setSelectedPost({
            ...selectedPost,
            savedBy: isSaved
              ? (selectedPost.savedBy || []).filter(
                  (id) => id !== currentUser._id
                )
              : [...(selectedPost.savedBy || []), currentUser._id],
          });
        }

        if (activeTab === "saved") {
          setTimeout(() => {
            refreshSavedPosts();
          }, 300);
        }
      }
    },
    [
      currentUser,
      savePostFunction,
      activeTab,
      userPosts,
      savedPosts,
      selectedPost,
      refreshSavedPosts,
    ]
  );

  const handleProfileUpdate = useCallback((updatedUser: IUser) => {
    setProfileUser(updatedUser);
  }, []);

  const handleFollowToggle = useCallback(async () => {
    if (!currentUser || !profileUser) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profileUser._id, currentUser._id);
        setProfileUser((prev) => {
          if (!prev) return prev;
          const followers = Array.isArray(prev.followers)
            ? [...prev.followers]
            : [];
          const updatedFollowers = followers.filter(
            (id) => id !== currentUser._id
          );
          return { ...prev, followers: updatedFollowers };
        });
      } else {
        await followUser(profileUser._id, currentUser._id);
        setProfileUser((prev) => {
          if (!prev) return prev;
          const followers = Array.isArray(prev.followers)
            ? [...prev.followers]
            : [];
          return { ...prev, followers: [...followers, currentUser._id] };
        });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Error toggling follow status:", err);
    } finally {
      setFollowLoading(false);
    }
  }, [currentUser, profileUser, isFollowing]);

  const handleTabChange = useCallback(
    (tab: "posts" | "saved" | "tagged") => {
      setActiveTab(tab);
      if (tab === "saved" && isOwnProfile && currentUser) {
        refreshSavedPosts();
      }
      if (tab === "tagged" && targetUserId) {
        fetchTaggedPosts(targetUserId);
      }
    },
    [
      isOwnProfile,
      currentUser,
      targetUserId,
      refreshSavedPosts,
      fetchTaggedPosts,
    ]
  );

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  const handlePostClick = useCallback((post: IPost) => {
    setSelectedPost(post);
  }, []);

  const handleStoryClick = useCallback((storyIndex: number) => {
    setActiveStoryIndex(storyIndex);
  }, []);

  const handleShowLoginPrompt = useCallback(() => {
    setShowLoginPrompt(true);
  }, []);

  const profileHeaderProps = useMemo(
    () => ({
      user: profileUser,
      isOwnProfile,
      postCount,
      isFollowing,
      onProfileUpdate: handleProfileUpdate,
      onFollowToggle: handleFollowToggle,
      onStoryClick: handleStoryClick,
      isReadOnly: !currentUser,
      onShowLoginPrompt: handleShowLoginPrompt,
    }),
    [
      profileUser,
      isOwnProfile,
      postCount,
      isFollowing,
      handleProfileUpdate,
      handleFollowToggle,
      handleStoryClick,
      currentUser,
      handleShowLoginPrompt,
    ]
  );

  const userInfoSidebarProps = useMemo(
    () => ({
      user: profileUser,
      isOwnProfile,
      onProfileUpdate: handleProfileUpdate,
    }),
    [profileUser, isOwnProfile, handleProfileUpdate]
  );

  const displayPosts = useMemo(() => {
    if (activeTab === "posts") return userPosts;
    if (activeTab === "saved") return savedPosts;
    return taggedPosts;
  }, [activeTab, userPosts, savedPosts, taggedPosts]);

  if (loading) {
    return (
      <div className="relative min-h-screen text-white">
        <Background />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <Background />
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="hidden lg:block lg:w-72 lg:mr-6">
            <UserInfoSidebar {...userInfoSidebarProps} />
          </div>

          <div className="w-full lg:flex-1">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 lg:-ml-4">
                <ProfileHeader {...profileHeaderProps} />
              </div>

              <div className="md:block lg:hidden mb-6">
                <UserInfoSidebar {...userInfoSidebarProps} />
              </div>

              <div>
                <div className="flex mb-2">
                  <button
                    onClick={() => handleTabChange("posts")}
                    className={`flex-1 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === "posts"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Posts
                  </button>
                  {isOwnProfile && (
                    <button
                      onClick={() => handleTabChange("saved")}
                      className={`flex-1 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === "saved"
                          ? "border-blue-500 text-blue-500"
                          : "border-transparent text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Saved
                    </button>
                  )}
                  <button
                    onClick={() => handleTabChange("tagged")}
                    className={`flex-1 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === "tagged"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Tagged
                  </button>
                </div>

                <div className="mt-8">
                  {displayPosts.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-center p-4 max-w-md mx-auto rounded-xl bg-gradient-to-r from-white/20 to-purple-500/20 backdrop-blur-sm shadow-lg border border-purple-300/30"
                    >
                      <div className="bg-gradient-to-br from-blue-400/20 to-purple-400/20 p-4 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto mb-3 text-purple-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {activeTab === "posts" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          ) : activeTab === "saved" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          )}
                        </svg>
                        <h2 className="text-xl font-bold text-white mb-2">
                          {activeTab === "posts"
                            ? isOwnProfile
                              ? "No Posts Yet"
                              : "This user hasn't posted yet"
                            : activeTab === "saved"
                            ? "No Saved Posts"
                            : "No Tagged Posts"}
                        </h2>
                        <p className="text-purple-400 text-sm">
                          {activeTab === "posts"
                            ? isOwnProfile
                              ? "Connect with friends through your posts"
                              : "Check back later to see this user's posts"
                            : activeTab === "saved"
                            ? "Save posts you like to view them later"
                            : "Posts where this user is tagged will appear here"}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div>
                      <PostGrid
                        posts={displayPosts}
                        viewMode={viewMode}
                        onViewModeChange={handleViewModeChange}
                        onPostClick={handlePostClick}
                      />
                      {viewMode === "list" && (
                        <div className="space-y-6 mt-2">
                          {displayPosts.map((post) => (
                            <PostCard
                              key={post._id}
                              _id={post._id || ""}
                              userId={post.userId}
                              desc={post.desc}
                              likes={post.likes || []}
                              savedBy={post.savedBy || []}
                              image={post.image}
                              comments={post.comments || []}
                              onLike={() =>
                                post._id && handleLikePost(post._id)
                              }
                              onSave={() =>
                                post._id && handleSavePost(post._id)
                              }
                              isLiked={
                                currentUser
                                  ? post.likes?.includes(currentUser._id)
                                  : false
                              }
                              isSaved={
                                currentUser && post.savedBy
                                  ? post.savedBy.includes(currentUser._id)
                                  : false
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-8">
                    <div className="border-t border-gray-200 my-4"></div>
                    <div className="px-3">
                      <div className="flex flex-wrap gap-1 text-xs text-gray-300 justify-center">
                        <a
                          href="/about"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          About
                        </a>
                        <span>·</span>
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Privacy Policy
                        </a>
                        <span>·</span>
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Terms of Service
                        </a>
                        <span>·</span>
                        <a
                          href="/contact"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Contact
                        </a>
                      </div>
                      <p className="text-xs text-gray-300 mt-2 text-center">
                        © 2025 LIONSHPERE BY TAVI GINGU
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:w-80">
            <Dashboard />
          </div>
        </div>

        {selectedPost && (
          <PostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onLike={handleLikePost}
            onSave={handleSavePost}
          />
        )}

        {activeStoryIndex !== null && storyGroups[activeStoryIndex] && (
          <StoryViewer
            storyGroup={storyGroups[activeStoryIndex]}
            onClose={() => {
              setActiveStoryIndex(null);
              setActiveStoryGroup(null);
            }}
          />
        )}

        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Sign in required
              </h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to follow users.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <FaSignInAlt />
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
                  onClick={() =>
                    navigate("/login", { state: { isRegister: true } })
                  }
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1 mx-auto"
                >
                  <FaUserPlus />
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
