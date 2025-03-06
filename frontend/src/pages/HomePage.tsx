import { useEffect, useState } from "react";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import Background from "../components/Background";
import ProfileSide from "../components/ProfileSide";
import PostCard from "../components/PostCard";
import PostCreationForm from "../components/PostCreationForm";

const HomePage: React.FC = () => {
  const { logout, user } = useAuthStore();
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

      {/* Buton de deconectare */}
      <button
        onClick={handleTempLogout}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition z-20"
      >
        Deconectare
      </button>

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar cu profilul - coloana stânga fixă */}
          <div className="w-full lg:w-80 mb-6 lg:mb-0 lg:mr-8">
            <div className="lg:sticky lg:top-4">
              <ProfileSide />
            </div>
          </div>

          {/* Conținut principal - coloana dreaptă */}
          <div className="w-full lg:flex-1 lg:ml-8">
            {/* Formular de creare postare */}
            {/*<PostCreationForm onPostCreated={handlePostCreated} />

            {/* Spațiu între formular și postări */}
            <div className="h-6"></div>

            {/* Indicator de încărcare */}
            {loading && (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Mesaj când nu există postări */}
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
              /* Lista de postări */
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
  );
};

export default HomePage;
