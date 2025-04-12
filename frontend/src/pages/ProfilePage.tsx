import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  const isOwnProfile = currentUser?._id === (userId || currentUser?._id);
  const targetUserId = userId || currentUser?._id;
  const postCount = userPosts.length;

  // Funcția pentru a încărca datele profilului
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

        // Fetch tagged posts
        await fetchTaggedPosts(targetUserId);

        // Încărcăm story-urile pentru utilizator
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
        // Pentru taggedPosts folosim starea direct din store

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
        // Actualizăm fără a declanșa un re-render complet
        setProfileUser((prev) => {
          if (!prev) return prev;
          const followers = Array.isArray(prev.followers)
            ? ([...prev.followers] as string[])
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
            ? ([...prev.followers] as string[])
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

  // Memorăm props-urile pentru a preveni re-renderizări inutile
  const profileHeaderProps = useMemo(
    () => ({
      user: profileUser,
      isOwnProfile,
      postCount,
      isFollowing,
      onProfileUpdate: handleProfileUpdate,
      onFollowToggle: handleFollowToggle,
    }),
    [
      profileUser, // Include obiectul întreg ca dependență
      isOwnProfile,
      postCount,
      isFollowing,
      handleProfileUpdate,
      handleFollowToggle,
    ]
  );

  const userInfoSidebarProps = useMemo(
    () => ({
      user: profileUser,
      isOwnProfile,
      onProfileUpdate: handleProfileUpdate,
    }),
    [
      profileUser, // Include obiectul întreg ca dependență
      isOwnProfile,
      handleProfileUpdate,
    ]
  );

  // Obține postările care trebuie afișate în funcție de tabul activ
  const displayPosts = useMemo(() => {
    if (activeTab === "posts") return userPosts;
    if (activeTab === "saved") return savedPosts;
    return taggedPosts;
  }, [activeTab, userPosts, savedPosts, taggedPosts]);

  if (loading) {
    return (
      <div className="relative min-h-screen text-white">
        <Background />
        <div className="container mx-auto px-4 py-8 relative z-10 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Dashboard />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="relative min-h-screen text-white">
        <Background />
        <div className="container mx-auto px-4 py-8 relative z-10 flex justify-center items-center h-screen">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error || "User not found"}</p>
            <button
              onClick={() => navigate("/home")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Return to Home
            </button>
          </div>
        </div>
        <Dashboard />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <Background />

      <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96 lg:ml-48">
        <div className="flex flex-col lg:flex-row">
          {/* <div className="hidden lg:block lg:w-80 mb-6 lg:mb-2">
            <div className="lg:sticky lg:top-4">
              <UserInfoSidebar {...userInfoSidebarProps} />
            </div>
          </div> */}
          <div className="hidden lg:block lg:w-72 mb-6 lg:mb-0 lg:-mr-44">
            <div className="space-y-6">
              <UserInfoSidebar {...userInfoSidebarProps} />
            </div>
          </div>

          <div className="w-full lg:flex-1 mx-0 lg:mx-6">
            <div className="max-w-2xl mx-auto">
              <div className="px-0">
                <ProfileHeader
                  {...profileHeaderProps}
                  onStoryClick={handleStoryClick}
                />
              </div>

              <div className="mt-6">
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

                <div className="mt-2">
                  {displayPosts.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-center">
                      <p className="text-white">
                        {activeTab === "posts"
                          ? isOwnProfile
                            ? "You haven't created any posts yet."
                            : "This user hasn't created any posts yet."
                          : activeTab === "saved"
                          ? "You haven't saved any posts yet."
                          : "This user hasn't been tagged in any posts yet."}
                      </p>
                    </div>
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
                </div>
              </div>
            </div>
          </div>
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

      {/* {activeStoryIndex !== null && storyGroups[activeStoryIndex] && (
        <StoryViewer
          storyGroup={storyGroups[activeStoryIndex]}
          onClose={() => {
            setActiveStoryIndex(null);
            setActiveStoryGroup(null);
          }}
        />
      )} */}

      <Dashboard />
    </div>
  );
};

export default ProfilePage;
