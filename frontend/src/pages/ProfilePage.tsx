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

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const { likePost: likeSinglePost } = usePostStore();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<IUser | null>(null);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setProfileUser(userResponse.data.user);

          // Fetch user's posts
          const postsResponse = await axios.get(
            `http://localhost:5001/post/${targetUserId}/timeline`
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
  }, [targetUserId, navigate]);

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
              <UserInfoSidebar user={profileUser} />
            </div>
          </div>

          {/* Main content - middle column */}
          <div className="w-full lg:flex-1 mx-0 lg:ml-6 lg:mr-6">
            {/* Profile header */}
            <ProfileHeader user={profileUser} isOwnProfile={isOwnProfile} />

            {/* User's posts section */}
            <div className="mt-6 ml-19">
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

      {/* Right-side fixed dashboard */}
      <Dashboard />
    </div>
  );
};

export default ProfilePage;
