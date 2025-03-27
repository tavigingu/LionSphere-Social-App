import { ChangeEvent, useState, FormEvent } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import uploadFile from "../helpers/uploadFile";

interface PostCreationFormProps {
  onPostCreated?: () => void;
}

const PostCreationForm: React.FC<PostCreationFormProps> = ({
  onPostCreated,
}) => {
  const { user } = useAuthStore();
  const { createNewPost, loading, error, clearError } = usePostStore();

  const [desc, setDesc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (error) clearError();
    if (localError) setLocalError(null);
    setDesc(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    if (localError) setLocalError(null);

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
    setLocalError(null);

    if (!user || !user._id) {
      setLocalError("User not authenticated");
      return;
    }

    if (!selectedFile) {
      setLocalError("A photo is required to create a post");
      return;
    }

    try {
      let imageUrl = "";

      if (selectedFile) {
        setIsUploading(true);

        try {
          const uploadResponse = await uploadFile(selectedFile);
          imageUrl = uploadResponse.secure_url;
        } catch (err) {
          setLocalError(
            `Upload failed: ${err instanceof Error ? err.message : String(err)}`
          );
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      await createNewPost({
        userId: user._id,
        desc: desc,
        image: imageUrl,
      });

      setDesc("");
      setSelectedFile(null);
      setPreviewUrl(null);

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setLocalError(
        `${err instanceof Error ? err.message : "Failed to create post"}`
      );
    }
  };

  const isPostButtonDisabled = !selectedFile || loading || isUploading;

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        onClick={onPostCreated}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <FaTimes size={20} />
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Create a Post</h2>

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
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Description Textarea */}
        <textarea
          value={desc}
          onChange={handleTextChange}
          // placeholder="What's on your mind?"
          className="w-full p-3 rounded-lg border text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
          rows={4}
        />

        {/* File Preview */}
        {previewUrl ? (
          <div className="relative mb-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-80 object-cover rounded-lg" // Adjusted height for a taller, portrait-like appearance
            />
            <button
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
            Create your post
          </p>
        )}

        {/* Error Message */}
        {(error || localError) && (
          <p className="text-red-500 text-sm mb-4">{error || localError}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPostButtonDisabled}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-200 ${
            isPostButtonDisabled
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          }`}
        >
          {isUploading ? "Uploading..." : loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default PostCreationForm;
