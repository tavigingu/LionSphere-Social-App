import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/AuthStore";
import usePostStore from "../../store/PostStore";
import uploadFile from "../../helpers/uploadFile";
import ImageSelectionStep from "./ImageSelectionStep";
import EditPostStep from "./EditPostStep";
import { IUser } from "../../types/AuthTypes";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { createNewPost } = usePostStore();

  // State for multi-step process
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{
    name: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [taggedUsers, setTaggedUsers] = useState<
    { userId: string; username: string; position: { x: number; y: number } }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for tagging on image
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset all states when modal is closed
  const handleReset = () => {
    setStep(1);
    setSelectedFile(null);
    setPreviewImage(null);
    setDescription("");
    setLocation(null);
    setTaggedUsers([]);
    setIsSubmitting(false);
    setError(null);
  };

  // Close modal and reset states
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Move to next step
    setStep(2);
  };

  // Go back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle location selection
  const handleLocationSelect = (locationData: {
    name: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    setLocation(locationData);
  };

  // Handle tagging users on image
  const handleTagUser = (user: IUser, position: { x: number; y: number }) => {
    // Check if user is already tagged
    const isAlreadyTagged = taggedUsers.some(
      (taggedUser) => taggedUser.userId === user._id
    );

    if (isAlreadyTagged) {
      // Update position if already tagged
      setTaggedUsers((prev) =>
        prev.map((taggedUser) =>
          taggedUser.userId === user._id
            ? { ...taggedUser, position }
            : taggedUser
        )
      );
    } else {
      // Add new tagged user
      setTaggedUsers((prev) => [
        ...prev,
        {
          userId: user._id,
          username: user.username,
          position,
        },
      ]);
    }
  };

  // Remove a tagged user
  const handleRemoveTag = (userId: string) => {
    setTaggedUsers((prev) => prev.filter((user) => user.userId !== userId));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user || !selectedFile) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload image to Cloudinary
      const uploadResult = await uploadFile(selectedFile);
      const imageUrl = uploadResult.secure_url;

      // Create post with all data
      await createNewPost({
        userId: user._id,
        desc: description,
        image: imageUrl,
        location: location || undefined,
        taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      });

      // Close modal after successful submission
      handleClose();
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={handleClose}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="py-4 px-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <h2 className="text-xl text-gray-600 font-semibold">
              {step === 1 ? "Create New Post" : "Edit Post"}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-auto">
          {step === 1 && <ImageSelectionStep onFileSelect={handleFileSelect} />}

          {step === 2 && previewImage && (
            <EditPostStep
              previewImage={previewImage}
              imageRef={imageRef}
              description={description}
              setDescription={setDescription}
              location={location}
              onLocationSelect={handleLocationSelect}
              taggedUsers={taggedUsers}
              onTagUser={handleTagUser}
              onRemoveTag={handleRemoveTag}
              isSubmitting={isSubmitting}
              error={error}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePostModal;
