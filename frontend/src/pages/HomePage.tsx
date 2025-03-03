import { useEffect, useState } from "react";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import Background from "../components/Background";
import ProfileSide from "../components/ProfileSide";
import PostCard from "../components/PostCard";
import PostCreateForm from "../components/PostCreationForm";

const HomePage: React.FC = () => {
  const { logout, user } = useAuthStore();
  const {
    timelinePosts,
    loading,
    error,
    fetchTimelinePosts,
    likePost: likeSinglePost,
  } = usePostStore();

  // const [newPostDesc, setNewPostDesc] = useState("");

  useEffect(() => {
    if (user && user._id) {
      fetchTimelinePosts(user._id);
    }
  }, [user, fetchTimelinePosts]);

  const handleTempLogout = async () => {
    try {
      await logout();
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
      <button
        onClick={handleTempLogout}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        Deconectare
      </button>
      <div className="relative z-10 flex flex-col lg:flex-row max-w-screen-xl mx-auto">
        {/* ProfileSide pentru mobile și desktop */}
        <div className="w-full md:block md:relative md:max-w-[600px] sm:max-w-[300px] sm:items-center md:ml-0 lg:w-[500px] lg:ml-[25px] lg:fixed lg:left-0 lg:top-4 lg:h-auto p-4">
          <ProfileSide />
        </div>

        {/* Conținutul principal (postările) centrat */}
        <div className="w-full lg:ml-[300px] md:ml-0 flex justify-center items-start lg:items-center min-h-screen p-4">
          <div className="grid grid-cols-1 gap-6 w-full max-w-[900px] md:max-w-[800px] sm:max-w-[600px] sm:items-center lg:max-w-[1000px] pt-4">
            {/* Post creation form */}
            <PostCreateForm onPostCreated={handlePostCreated} />

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Display posts */}
            {!loading && timelinePosts.length === 0 ? (
              <div className="text-center p-6 backdrop-blur-sm bg-white/5 rounded-xl">
                <p className="text-lg text-gray-300">
                  Nu există postări de afișat.
                </p>
                <p className="text-gray-400 mt-2">
                  Urmărește alți utilizatori sau creează prima ta postare!
                </p>
              </div>
            ) : (
              timelinePosts.map((post) => (
                <PostCard
                  key={post._id}
                  userId={post.userId}
                  username={post.username}
                  desc={post.desc}
                  likes={post.likes || []}
                  image={post.image}
                  _id={post._id}
                  onLike={() => post._id && handleLikePost(post._id)}
                  isLiked={user ? post.likes?.includes(user._id) : false}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
