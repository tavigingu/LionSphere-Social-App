import React, { useState, useRef } from "react";
import {
  FaPlus,
  FaTimes,
  FaCheck,
  FaSearchPlus,
  FaSearchMinus,
  FaUndoAlt,
  FaSun,
  FaMoon,
  FaAdjust,
  FaCloudSun,
  FaCloudMoon,
} from "react-icons/fa";
import { motion } from "framer-motion";
import useAuthStore from "../../store/AuthStore";
import useStoryStore from "../../store/StoryStore";
import uploadFile from "../../helpers/uploadFile";

interface StoryEditorProps {
  onStoryCreated?: () => void;
  onCancel?: () => void;
}

const StoryEditor: React.FC<StoryEditorProps> = ({
  onStoryCreated,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const { createStory } = useStoryStore();

  // Image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100); // 100% is normal
  const [blur, setBlur] = useState(0); // 0px is normal (no blur)
  const [bgBlur, setBgBlur] = useState(15); // 15px for background blur

  // Canvas references
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Standard story dimensions
  const STORY_WIDTH = 360;
  const STORY_HEIGHT = 640;
  const STORY_RATIO = STORY_HEIGHT / STORY_WIDTH;

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create temporary URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);

        // Reset transformations
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setBrightness(100);
        setBlur(0);
        setBgBlur(15);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image manipulation functions
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleBrightnessUp = () => {
    setBrightness((prev) => Math.min(prev + 10, 200));
  };

  const handleBrightnessDown = () => {
    setBrightness((prev) => Math.max(prev - 10, 50));
  };

  const handleBlurIncrease = () => {
    setBlur((prev) => Math.min(prev + 1, 10));
  };

  const handleBlurDecrease = () => {
    setBlur((prev) => Math.max(prev - 1, 0));
  };

  const handleBgBlurIncrease = () => {
    setBgBlur((prev) => Math.min(prev + 5, 30));
  };

  const handleBgBlurDecrease = () => {
    setBgBlur((prev) => Math.max(prev - 5, 0));
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!previewUrl) return;

    setIsDragging(true);

    // Get initial position
    if ("touches" in e) {
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    } else {
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !previewUrl) return;

    e.preventDefault();

    // Calculate new position
    let newX, newY;
    if ("touches" in e) {
      newX = e.touches[0].clientX - dragStart.x;
      newY = e.touches[0].clientY - dragStart.y;
    } else {
      newX = e.clientX - dragStart.x;
      newY = e.clientY - dragStart.y;
    }

    // Movement limits based on zoom
    const containerWidth = canvasRef.current?.clientWidth || STORY_WIDTH;
    const containerHeight = canvasRef.current?.clientHeight || STORY_HEIGHT;
    const imageWidth = imageRef.current?.width || 0;
    const imageHeight = imageRef.current?.height || 0;

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

    // Apply limits
    newX = Math.min(Math.max(newX, -maxX), maxX);
    newY = Math.min(Math.max(newY, -maxY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const resetTransformations = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setBrightness(100);
    setBlur(0);
    setBgBlur(15);
  };

  // Story creation and upload function
  const handleCreateStory = async () => {
    if (!user || !selectedFile || !canvasRef.current) {
      setError("Missing required data to create story");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create canvas to capture image with blur effect
      const canvas = document.createElement("canvas");
      canvas.width = STORY_WIDTH;
      canvas.height = STORY_HEIGHT;
      const ctx = canvas.getContext("2d");

      if (!ctx || !imageRef.current) {
        throw new Error("Failed to create image context");
      }

      // First draw blurred background image
      // (scaled image to fill entire canvas, apply blur)
      ctx.filter = `blur(${bgBlur}px) brightness(0.7)`;

      // Calculate dimensions for background (always fill entire canvas)
      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;
      const imgRatio = imgHeight / imgWidth;

      let bgWidth = STORY_WIDTH;
      let bgHeight = STORY_WIDTH * imgRatio;

      if (bgHeight < STORY_HEIGHT) {
        bgHeight = STORY_HEIGHT;
        bgWidth = STORY_HEIGHT / imgRatio;
      }

      const bgX = (STORY_WIDTH - bgWidth) / 2;
      const bgY = (STORY_HEIGHT - bgHeight) / 2;

      // Draw blurred background
      ctx.drawImage(imageRef.current, bgX, bgY, bgWidth, bgHeight);

      // Then draw transformed main image
      ctx.filter = `brightness(${brightness}%) blur(${blur}px)`;

      // Calculate main image dimensions and position
      let mainWidth, mainHeight, mainX, mainY;

      if (imgRatio > STORY_RATIO) {
        // Image is taller than story ratio
        mainWidth = STORY_WIDTH;
        mainHeight = mainWidth * imgRatio;
      } else {
        // Image is wider than story ratio
        mainHeight = STORY_HEIGHT;
        mainWidth = mainHeight / imgRatio;
      }

      // Apply scaling
      mainWidth *= scale;
      mainHeight *= scale;

      // Center image and apply positioning
      mainX = (STORY_WIDTH - mainWidth) / 2 + position.x;
      mainY = (STORY_HEIGHT - mainHeight) / 2 + position.y;

      // Draw main image
      ctx.drawImage(imageRef.current, mainX, mainY, mainWidth, mainHeight);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else throw new Error("Failed to create image blob");
          },
          "image/jpeg",
          0.9
        );
      });

      // Convert blob to File
      const processedFile = new File([blob], "story.jpg", {
        type: "image/jpeg",
      });

      // Upload File to Cloudinary
      const uploadResponse = await uploadFile(processedFile);

      // Create story
      await createStory({
        userId: user._id,
        image: uploadResponse.secure_url,
      });

      // Reset and close
      setSelectedFile(null);
      setPreviewUrl(null);

      if (onStoryCreated) {
        onStoryCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create story");
      console.error("Error creating story:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl overflow-hidden flex flex-col w-full max-w-md h-[80vh] shadow-2xl"
      >
        {/* Header */}
        <div className="relative z-20 p-4 flex justify-between items-center border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Create Story</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <FaTimes size={15} />
          </motion.button>
        </div>

        {/* Main canvas area */}
        <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-gray-100">
          {previewUrl ? (
            <div className="relative w-full h-full">
              {/* Edit canvas */}
              <div
                ref={canvasRef}
                className="absolute inset-0 overflow-hidden"
                style={{
                  maxWidth: STORY_WIDTH,
                  maxHeight: STORY_HEIGHT,
                  width: "100%",
                  height: "100%",
                  margin: "auto",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                {/* Blurred background */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-50"
                  style={{
                    backgroundImage: `url(${previewUrl})`,
                    filter: `blur(${bgBlur}px)`,
                  }}
                ></div>

                {/* Main image */}
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Story preview"
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    style={{
                      transform: `scale(${scale}) translate(${
                        position.x / scale
                      }px, ${position.y / scale}px)`,
                      transformOrigin: "center center",
                      filter: `brightness(${brightness}%) blur(${blur}px)`,
                    }}
                  />
                </div>

                {/* Edit instructions */}
                <div className="absolute top-2 left-2 right-2 backdrop-blur-md bg-white/80 text-gray-700 text-xs p-3 rounded-lg shadow-md">
                  <p className="text-center">Move the image with drag & drop</p>
                </div>
              </div>

              {/* Edit controls - in a scrollable container that fits within the white background */}
              <div className="absolute left-0 right-0 bottom-6 px-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg py-2 overflow-x-auto">
                  {/* Use a container with flex-wrap to ensure buttons fit on smaller screens */}
                  <div className="flex justify-center items-center px-2">
                    <div className="flex space-x-2 md:space-x-3 flex-nowrap">
                      {/* Zoom out */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleZoomOut}
                        className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md text-white"
                        title="Zoom out"
                      >
                        <FaSearchMinus size={14} />
                      </motion.button>

                      {/* Zoom in */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleZoomIn}
                        className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md text-white"
                        title="Zoom in"
                      >
                        <FaSearchPlus size={14} />
                      </motion.button>

                      {/* Decrease brightness */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBrightnessDown}
                        className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md text-white"
                        title="Decrease brightness"
                      >
                        <FaMoon size={14} />
                      </motion.button>

                      {/* Increase brightness */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBrightnessUp}
                        className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md text-white"
                        title="Increase brightness"
                      >
                        <FaSun size={14} />
                      </motion.button>

                      {/* Decrease image blur */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBlurDecrease}
                        className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md text-white"
                        title="Decrease image blur"
                      >
                        <FaAdjust size={14} />
                        <span className="absolute text-[9px] font-bold">-</span>
                      </motion.button>

                      {/* Increase image blur */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBlurIncrease}
                        className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md text-white"
                        title="Increase image blur"
                      >
                        <FaAdjust size={14} />
                        <span className="absolute text-[9px] font-bold">+</span>
                      </motion.button>

                      {/* Decrease background blur */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBgBlurDecrease}
                        className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md text-white"
                        title="Decrease background blur"
                      >
                        <FaCloudSun size={14} />
                      </motion.button>

                      {/* Increase background blur */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBgBlurIncrease}
                        className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md text-white"
                        title="Increase background blur"
                      >
                        <FaCloudMoon size={14} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                  type: "spring",
                  bounce: 0.4,
                }}
                className="mb-8"
              >
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 30px 5px rgba(147, 51, 234, 0.3)",
                  }}
                  className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaPlus className="text-white text-3xl group-hover:scale-110 transition-transform" />
                </motion.div>
                <h3 className="text-gray-800 text-xl font-bold mb-2">
                  Create a Story
                </h3>
                <p className="text-gray-500 text-sm mt-2 px-4">
                  Share a moment with your friends that will disappear after 24
                  hours
                </p>
              </motion.div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Footer with buttons */}
        {previewUrl && (
          <div className="p-4 bg-white border-t border-gray-200 flex justify-between">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              Reset
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateStory}
              disabled={isUploading}
              className={`px-6 py-2.5 rounded-xl flex items-center justify-center ${
                isUploading
                  ? "bg-gradient-to-r from-blue-300 to-purple-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              } text-white transition-all duration-300`}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  <span>Share Story</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 left-0 right-0 mx-auto p-3 max-w-xs bg-red-500 text-white text-center rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default StoryEditor;
