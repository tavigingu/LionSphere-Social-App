import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import Background from "../components/Home/Background";
import PostCard from "../components/Home/PostCard";
import Dashboard from "../components/Home/Dashboard";
import ProfileHeader from "../components/Profile/ProfileHeader";
import UserInfoSidebar from "../components/Profile/UserInfoSide";
import { IUser } from "../types/AuthTypes";
import { IPost } from "../types/PostTypes";
import { followUser, unfollowUser, checkFollowStatus } from "../api/User";

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const { likePost: likeSinglePost } = usePostStore();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<IUser | null>(null);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = currentUser?._id === (userId || currentUser?._id);
  // If no userId is provided, use the current user's ID
  const targetUserId = userId || currentUser?._id;

  useEffect(() => {
    if (!targetUserId) {
      navigate("/login");
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch user profile data
        const userResponse = await axios.get(
          `http://localhost:5001/user/${targetUserId}`
        );

        if (userResponse.data.success) {
          const userData = userResponse.data.user;
          setProfileUser(userData);

          // Check if the current user is following this profile
          if (currentUser && !isOwnProfile) {
            setIsFollowing(checkFollowStatus(userData, currentUser._id));
          }

          // Fetch user's posts
          const postsResponse = await axios.get(
            `http://localhost:5001/post/${targetUserId}/posts`
          );

          if (postsResponse.data.success) {
            // Filter only the posts that belong to this user
            const userPosts = postsResponse.data.posts.filter(
              (post: IPost) => post.userId === targetUserId
            );
            setUserPosts(userPosts);
          }
        } else {
          setError("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("An error occurred while fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUserId, navigate, currentUser, isOwnProfile]);

  const handleLikePost = async (postId: string) => {
    if (currentUser && currentUser._id) {
      await likeSinglePost(postId, currentUser._id);

      // Update the local state to reflect the like change
      setUserPosts((prevPosts) =>
        prevPosts.map((post) => {
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
        })
      );
    }
  };

  const handleProfileUpdate = (updatedUser: IUser) => {
    setProfileUser(updatedUser);
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profileUser._id, currentUser._id);
        // Update profile user's followers count - handle as string[]
        setProfileUser((prev) => {
          if (!prev) return prev;
          // Explicitly cast followers to string[] for correct typing
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
        // Update profile user's followers count - handle as string[]
        setProfileUser((prev) => {
          if (!prev) return prev;
          // Explicitly cast followers to string[] for correct typing
          const followers = Array.isArray(prev.followers)
            ? ([...prev.followers] as string[])
            : [];
          return { ...prev, followers: [...followers, currentUser._id] };
        });
      }
      // Toggle following state
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Error toggling follow status:", err);
    } finally {
      setFollowLoading(false);
    }
  };

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

      {/* Main content */}
      <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
        <div className="flex flex-col lg:flex-row">
          {/* Left sidebar with user info - visible on desktop, hidden on mobile */}
          <div className="hidden lg:block lg:w-80 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-4">
              <UserInfoSidebar
                user={profileUser}
                isOwnProfile={isOwnProfile}
                onProfileUpdate={handleProfileUpdate}
              />
            </div>
          </div>

          {/* Main content - middle column with same positioning as HomePage */}
          <div className="w-full lg:flex-1 mx-0 lg:mx-6">
            {/* Main content wrapper with consistent width */}
            <div className="max-w-2xl mx-auto">
              {/* Profile header with post count */}
              <div className="px-0">
                <ProfileHeader
                  user={profileUser}
                  isOwnProfile={isOwnProfile}
                  postCount={userPosts.length}
                  isFollowing={isFollowing}
                  onProfileUpdate={handleProfileUpdate}
                  onFollowToggle={handleFollowToggle}
                />
              </div>

              {/* Butonul de follow a fost mutat în ProfileHeader */}

              {/* User's posts section */}
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4 text-white">Posts</h2>

                {userPosts.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-center">
                    <p className="text-white">
                      {isOwnProfile
                        ? "You haven't created any posts yet."
                        : "This user hasn't created any posts yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <PostCard
                        key={post._id}
                        _id={post._id || ""}
                        userId={post.userId}
                        desc={post.desc}
                        likes={post.likes || []}
                        image={post.image}
                        comments={post.comments || []}
                        onLike={() => post._id && handleLikePost(post._id)}
                        isLiked={
                          currentUser
                            ? post.likes?.includes(currentUser._id)
                            : false
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right-side fixed dashboard */}
      <Dashboard />
    </div>
  );
};

export default ProfilePage;
