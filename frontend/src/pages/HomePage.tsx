import { useEffect } from "react";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import Background from "../components/Home/Background";
import ProfileSide from "../components/Home/ProfileSide";
import PostCard from "../components/Home/PostCard";
import Dashboard from "../components/Home/Dashboard";
import PeopleYouMayKnow from "../components/Home/PeopleYouMayKnow";

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    timelinePosts,
    loading,
    error,
    fetchTimelinePosts,
    likePost: likeSinglePost,
  } = usePostStore();

  useEffect(() => {
    if (user && user._id) {
      fetchTimelinePosts(user._id);
    }
  }, [user, fetchTimelinePosts]);

  const handleLikePost = async (postId: string) => {
    if (user && user._id) {
      await likeSinglePost(postId, user._id);
    }
  };

  const handlePostCreated = () => {
    if (user && user._id) {
      fetchTimelinePosts(user._id);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <Background />

      {/* Main content with padding adjusted for each screen size */}
      <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
        <div className="flex flex-col lg:flex-row">
          {/* Left sidebar with profile - hidden on mobile */}
          <div className="hidden lg:block lg:w-80 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-4">
              <ProfileSide />
            </div>
          </div>

          {/* Main content - middle column */}
          <div className="w-full lg:flex-1 mx-0 lg:mx-6">
            {/* Main content wrapper with consistent width */}
            <div className="max-w-2xl mx-auto">
              {/* People You May Know section - visible at the top of feed */}
              <div className="mb-6">
                <PeopleYouMayKnow />
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Message when no posts */}
              {!loading && timelinePosts.length === 0 ? (
                <div className="text-center p-6 backdrop-blur-sm bg-white/5 rounded-xl">
                  <p className="text-lg text-gray-300">No posts to display.</p>
                  <p className="text-gray-400 mt-2">
                    Follow other users or create your first post!
                  </p>
                </div>
              ) : (
                /* Post list */
                <div className="space-y-6">
                  {timelinePosts.map((post) => (
                    <PostCard
                      key={post._id}
                      _id={post._id || ""}
                      userId={post.userId}
                      desc={post.desc}
                      likes={post.likes || []}
                      image={post.image}
                      comments={post.comments || []}
                      onLike={() => post._id && handleLikePost(post._id)}
                      isLiked={user ? post.likes?.includes(user._id) : false}
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

export default HomePage;
