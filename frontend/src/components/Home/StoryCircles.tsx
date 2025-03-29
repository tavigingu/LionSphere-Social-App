// frontend/src/components/Home/StoryCircles.tsx
import React, { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import useAuthStore from "../../store/AuthStore";
import useStoryStore from "../../store/StoryStore";
import uploadFile from "../../helpers/uploadFile";

interface StoryCirclesProps {
  onCreateStory?: () => void;
}

const StoryCircles: React.FC<StoryCirclesProps> = ({ onCreateStory }) => {
  const { user } = useAuthStore();
  const { storyGroups, fetchStories, createStory, setActiveStoryGroup } =
    useStoryStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?._id) {
      fetchStories(user._id);
    }
  }, [user, fetchStories]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?._id) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Upload imagineea la Cloudinary
      const uploadResponse = await uploadFile(file);

      // Crează story-ul
      await createStory({
        userId: user._id,
        image: uploadResponse.secure_url,
        caption: "", // Opțional, poate fi implementat un input pentru descriere
      });

      if (onCreateStory) {
        onCreateStory();
      }

      // Reîncarcă stories pentru a include noul story
      fetchStories(user._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload story");
      console.error("Error creating story:", err);
    } finally {
      setIsUploading(false);
      // Reset input-ul de fișiere
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleStoryClick = (index: number) => {
    setActiveStoryGroup(index);
  };

  // Sortează grupurile astfel încât utilizatorul curent să fie primul, apoi cele cu stories nevăzute
  const sortedGroups = [...storyGroups].sort((a, b) => {
    // Utilizatorul curent este întotdeauna primul
    if (a.userId === user?._id) return -1;
    if (b.userId === user?._id) return 1;

    // Apoi, stories nevăzute
    if (a.hasUnseenStories && !b.hasUnseenStories) return -1;
    if (!a.hasUnseenStories && b.hasUnseenStories) return 1;

    // În final, după timestamp (presupunem că ordinea existentă reflectă asta)
    return 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-4">Stories</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar">
        {/* Add Story button - only for current user */}
        {user && (
          <div className="flex flex-col items-center min-w-[72px]">
            <label className="cursor-pointer relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                {isUploading ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                ) : (
                  <>
                    {user.profilePicture ? (
                      <div className="w-full h-full rounded-full overflow-hidden relative">
                        <img
                          src={user.profilePicture}
                          alt="Your profile"
                          className="w-full h-full object-cover filter grayscale opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <FaPlus className="text-white text-lg" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaPlus className="text-white text-xs" />
                      </div>
                    )}
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {/* Indicator blue circle with plus */}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                <FaPlus className="text-white text-xs" />
              </div>
            </label>
            <span className="mt-1 text-xs text-gray-700 font-medium">
              Add Story
            </span>
          </div>
        )}

        {/* Story circles for each user */}
        {sortedGroups.map((group, index) => (
          <div
            key={group.userId}
            className="flex flex-col items-center min-w-[72px]"
          >
            <button
              onClick={() => handleStoryClick(index)}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                group.hasUnseenStories
                  ? "border-2 border-gradient-to-r from-blue-500 to-purple-500"
                  : "border-2 border-gray-300"
              }`}
              style={{
                borderImage: group.hasUnseenStories
                  ? "linear-gradient(to right, #3b82f6, #8b5cf6) 1"
                  : undefined,
              }}
            >
              <div className="w-14 h-14 rounded-full overflow-hidden">
                {group.profilePicture ? (
                  <img
                    src={group.profilePicture}
                    alt={`${group.username}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500to-purple-500 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {group.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </button>
            <span className="mt-1 text-xs text-gray-700 font-medium truncate w-full text-center">
              {group.userId === user?._id ? "Your Story" : group.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StoryCircles;
