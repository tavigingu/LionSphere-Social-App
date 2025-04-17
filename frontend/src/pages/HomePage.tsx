import { useEffect } from "react";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import useStoryStore from "../store/StoryStore";
import Background from "../components/Home/Background";
import ProfileSide from "../components/Home/ProfileSide";
import PostCard from "../components/Home/PostCard";
import Dashboard from "../components/Home/Dashboard";
import PeopleYouMayKnow from "../components/Home/PeopleYouMayKnow";
import StoryCircles from "../components/Home/StoryCircles";
import StoryViewer from "../components/Home/StoryViewer";

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    timelinePosts,
    loading: postsLoading,
    error: postsError,
    fetchTimelinePosts,
    likePost: likeSinglePost,
    savePost: savePostFunction,
  } = usePostStore();

  const {
    activeStoryGroup,
    fetchStories,
    loading: storiesLoading,
    error: storiesError,
  } = useStoryStore();

  useEffect(() => {
    if (user && user._id) {
      console.log("Fetching timeline posts and stories for user:", user._id);
      fetchTimelinePosts(user._id);
      fetchStories(user._id);
    }
  }, [user, fetchTimelinePosts, fetchStories]);

  useEffect(() => {
    console.log("Active story group in HomePage:", activeStoryGroup);
  }, [activeStoryGroup]);

  const handleLikePost = async (postId: string) => {
    if (user && user._id) {
      await likeSinglePost(postId, user._id);
    }
  };

  const handleSavePost = async (postId: string) => {
    if (user && user._id) {
      await savePostFunction(postId, user._id);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <Background />

      {/* Main content with responsive padding */}
      <div className="container mx-auto px-4 py-4 relative z-10 sm:px-6 md:px-8 lg:pr-80 lg:ml-10 xl:ml-20">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row lg:gap-4">
          {/* Left sidebar with profile - hidden on mobile, adjusted for tablets */}
          <div className="hidden lg:block lg:w-64 xl:w-72 mb-6 lg:mb-0 mr-4">
            <div className="space-y-6">
              <ProfileSide />
              <PeopleYouMayKnow />
            </div>
          </div>

          {/* Main content - middle column */}
          <div className="w-full lg:flex-1 mx-0 lg:mx-0 lg:-ml-2 lg:mr-28 xl:mr-32">
            {/* Main content wrapper with consistent width */}
            <div className="max-w-xl mx-auto">
              {storiesLoading && (
                <div className="flex justify-center items-center p-3 mb-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-300">
                    Se încarcă poveștile...
                  </span>
                </div>
              )}

              {storiesError && (
                <div className="bg-red-400 bg-opacity-20 text-white p-2 rounded-lg mb-6">
                  <p className="text-sm">
                    Eroare la încărcarea poveștilor: {storiesError}
                  </p>
                </div>
              )}

              <StoryCircles />

              {postsLoading && (
                <div className="flex justify-center items-center p-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}

              {postsError && (
                <div className="bg-red-400 bg-opacity-20 text-white p-3 rounded-lg mb-6">
                  <p>Eroare la încărcarea postărilor: {postsError}</p>
                </div>
              )}

              {!postsLoading && timelinePosts.length === 0 ? (
                <div className="text-center p-5 mb-6 backdrop-blur-sm bg-white/5 rounded-xl">
                  <p className="text-base text-gray-300">
                    Nicio postare de afișat.
                  </p>
                  <p className="text-gray-400 mt-1">
                    Urmărește alți utilizatori sau creează prima ta postare!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {timelinePosts.map((post) => (
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
                      onLike={() => post._id && handleLikePost(post._id)}
                      onSave={() => post._id && handleSavePost(post._id)}
                      isLiked={user ? post.likes?.includes(user._id) : false}
                      isSaved={
                        user && post.savedBy
                          ? post.savedBy.includes(user._id)
                          : false
                      }
                    />
                  ))}
                  {/* Footer Section */}
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right-side fixed dashboard */}
      <Dashboard />

      {activeStoryGroup && <StoryViewer />}
    </div>
  );
};

export default HomePage;
