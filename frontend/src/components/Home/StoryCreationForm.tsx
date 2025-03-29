// frontend/src/components/StoryCreationForm.tsx
import { ChangeEvent, useState, FormEvent } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import useAuthStore from "../../store/AuthStore";
import useStoryStore from "../../store/StoryStore";
import uploadFile from "../../helpers/uploadFile";

interface StoryCreationFormProps {
  onStoryCreated?: () => void;
}

const StoryCreationForm: React.FC<StoryCreationFormProps> = ({
  onStoryCreated,
}) => {
  const { user } = useAuthStore();
  const { createStory } = useStoryStore();

  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (error) setError(null);
    setCaption(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !user._id) {
      setError("User not authenticated");
      return;
    }

    if (!selectedFile) {
      setError("A photo is required to create a story");
      return;
    }

    try {
      setIsUploading(true);

      // Upload the image to Cloudinary
      const uploadResponse = await uploadFile(selectedFile);

      // Create the story
      await createStory({
        userId: user._id,
        image: uploadResponse.secure_url,
        caption: caption.trim() || undefined,
      });

      setCaption("");
      setSelectedFile(null);
      setPreviewUrl(null);

      if (onStoryCreated) {
        onStoryCreated();
      }
    } catch (err) {
      setError(
        `${err instanceof Error ? err.message : "Failed to create story"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Create a Story</h2>

      {/* User Info */}
      {user && (
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-bold">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user.username}</p>
            <p className="text-xs text-gray-500">
              Your story will disappear after 24 hours
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* File Preview */}
        {previewUrl ? (
          <div className="relative mb-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-80 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeSelectedFile}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <FaTimes size={16} />
            </button>
          </div>
        ) : (
          <div className="mb-4 flex justify-center">
            <label className="cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
                <FaPlus className="text-white" size={24} />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Instruction Text */}
        {!previewUrl && (
          <p className="text-center text-sm text-gray-500 mb-4">
            Click to add an image to your story
          </p>
        )}

        {/* Caption Textarea - only shown if file is selected */}
        {previewUrl && (
          <textarea
            value={caption}
            onChange={handleTextChange}
            placeholder="Add a caption to your story... (optional)"
            className="w-full p-3 rounded-lg border text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            rows={3}
            maxLength={200}
          />
        )}

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-200 ${
            !selectedFile || isUploading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Share Story"}
        </button>
      </form>
    </div>
  );
};

export default StoryCreationForm;
