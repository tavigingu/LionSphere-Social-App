import { ChangeEvent, useState, FormEvent } from "react";
import { FaImage, FaVideo, FaSmile } from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import uploadFile from "../helpers/uploadFile";

interface PostCreatFormProps {
  onPostCreated?: () => void;
}

const PostCreationForm: React.FC<PostCreatFormProps> = ({ onPostCreated }) => {
  const { user } = useAuthStore();
  const { createNewPost, loading, error, clearError } = usePostStore();

  const [desc, setDesc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Curăță erorile când se modifică conținutul
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

    if (!desc.trim() && !selectedFile) {
      setLocalError("Post must have text or image");
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
          return; // Exit early if upload fails
        }
        setIsUploading(false);
      }

      await createNewPost({
        userId: user._id,
        desc: desc,
        image: imageUrl,
      });

      // Reset form after successful post creation
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

  const isPostButtonDisabled =
    (!desc.trim() && !selectedFile) || loading || isUploading;

  return (
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl min-h-[200px] lg:min-w-[750px] backdrop-blur-sm bg-white/5 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800 transition-all duration-300">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Ce ai în minte azi?"
          value={desc}
          onChange={handleTextChange}
          className="w-full bg-transparent border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />

        {/* File preview */}
        {previewUrl && (
          <div className="relative mt-2 mb-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-40 rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={removeSelectedFile}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div className="w-full bg-gray-700 rounded-full h-2 my-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Error message - hidden by default */}
        {(error || localError) && (
          <div className="text-red-400 text-sm mt-2 p-2 bg-red-500/10 rounded hidden">
            {error || localError}
          </div>
        )}

        <div className="flex justify-between mt-3">
          <div className="flex space-x-2">
            <label className="cursor-pointer flex items-center text-blue-400 hover:text-blue-500 px-2 py-1">
              <FaImage className="mr-1" />
              <span>Fotografie</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
            <button
              type="button"
              className="flex items-center text-green-400 hover:text-green-500 px-2 py-1"
            >
              <FaVideo className="mr-1" />
              <span>Video</span>
            </button>
            <button
              type="button"
              className="flex items-center text-yellow-400 hover:text-yellow-500 px-2 py-1"
            >
              <FaSmile className="mr-1" />
              <span>Emoji</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={isPostButtonDisabled}
            className={`${
              isPostButtonDisabled
                ? "bg-blue-500/50"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-medium py-1 px-4 rounded-lg transition`}
          >
            {loading || isUploading ? "Se postează..." : "Postează"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreationForm;
