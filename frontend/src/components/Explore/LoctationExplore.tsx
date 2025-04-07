import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import PostGrid from "../Profile/PostGrid";
import PostModal from "../Profile/PostModal";
import { IPost } from "../../types/PostTypes";
import useAuthStore from "../../store/AuthStore";
import usePostStore from "../../store/PostStore";
import Background from "../Home/Background";
import Dashboard from "../Home/Dashboard";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface LocationCoordinates {
  lat: number;
  lng: number;
}

const mapContainerStyle = {
  width: "100%",
  height: "256px",
};

const LocationExplore: React.FC = () => {
  const { locationName } = useParams<{ locationName: string }>();
  const location = useLocation();
  const coordinates = location.state?.coordinates as LocationCoordinates;
  const { user } = useAuthStore();
  const { likePost, savePost } = usePostStore();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: ["places"],
  });

  useEffect(() => {
    const fetchLocationPosts = async () => {
      setLoading(true);
      try {
        console.log("Fetching posts for location:", locationName);
        const response = await axios.get(
          `http://localhost:5001/post/location/${encodeURIComponent(
            locationName || ""
          )}`
        );

        console.log("Response from backend:", response.data);
        if (response.data.success) {
          setPosts(response.data.posts);
        } else {
          setError("Failed to fetch posts for this location");
        }
      } catch (error) {
        console.error("Error fetching location posts:", error);
        setError("An error occurred while fetching posts");
      } finally {
        setLoading(false);
      }
    };

    if (locationName) {
      fetchLocationPosts();
    }
  }, [locationName]);

  const handlePostClick = (post: IPost) => {
    setSelectedPost(post);
  };

  const handleLikePost = async (postId: string) => {
    if (user && user._id) {
      await likePost(postId, user._id);

      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            const isLiked = post.likes.includes(user._id);
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((id) => id !== user._id)
                : [...post.likes, user._id],
            };
          }
          return post;
        })
      );
    }
  };

  const handleSavePost = async (postId: string) => {
    if (user && user._id) {
      await savePost(postId, user._id);

      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            const savedBy = post.savedBy || [];
            const isSaved = savedBy.includes(user._id);
            return {
              ...post,
              savedBy: isSaved
                ? savedBy.filter((id) => id !== user._id)
                : [...savedBy, user._id],
            };
          }
          return post;
        })
      );
    }
  };

  // Funcție goală pentru a preveni comutarea
  const handleViewModeChange = (_mode: "grid" | "list") => {
    // Nu face nimic, păstrăm doar "grid"
  };

  return (
    <div className="relative min-h-screen text-white">
      <Background />

      {coordinates && (
        <div className="fixed top-0 left-0 w-full z-10">
          <div className="w-full h-64 relative">
            {loadError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                Failed to load map
              </div>
            ) : !isLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={coordinates}
                zoom={12}
              >
                <Marker position={coordinates} />
              </GoogleMap>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 relative z-0 lg:pr-96 pt-64">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <h1 className="text-2xl text-gray-600 font-bold mb-2">
              {locationName}
            </h1>
            <p className="text-gray-500 mb-4">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-400/20 text-white p-4 rounded-lg mb-4">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-center">
              <p className="text-white">No posts found for this location.</p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <PostGrid
              posts={posts}
              viewMode="grid" // Fixăm modul la "grid"
              onViewModeChange={handleViewModeChange} // Funcție goală
              onPostClick={handlePostClick}
              showViewModeToggle={false} // Ascundem butoanele de comutare
            />
          )}
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

      <Dashboard />
    </div>
  );
};

export default LocationExplore;
