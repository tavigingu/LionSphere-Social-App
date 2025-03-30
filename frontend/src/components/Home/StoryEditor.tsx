import React, { useState, useRef, useEffect } from "react";
import {
  FaPlus,
  FaTimes,
  FaCheck,
  FaArrowsAlt,
  FaSearchPlus,
  FaSearchMinus,
  FaUndoAlt,
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

  // State pentru imagine
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State pentru editare
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Referințe pentru canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constante pentru dimensiunile standard de story
  const STORY_WIDTH = 360;
  const STORY_HEIGHT = 640;
  const STORY_RATIO = STORY_HEIGHT / STORY_WIDTH;

  // Handler pentru încărcarea fișierului
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Creăm un URL temporar pentru preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);

        // Resetăm transformările
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Funcții pentru manipularea imaginii
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!previewUrl) return;

    setIsDragging(true);

    // Obținem poziția inițială
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

    // Calculăm noua poziție
    let newX, newY;
    if ("touches" in e) {
      newX = e.touches[0].clientX - dragStart.x;
      newY = e.touches[0].clientY - dragStart.y;
    } else {
      newX = e.clientX - dragStart.x;
      newY = e.clientY - dragStart.y;
    }

    // Limitele de mișcare bazate pe zoom
    const containerWidth = canvasRef.current?.clientWidth || STORY_WIDTH;
    const containerHeight = canvasRef.current?.clientHeight || STORY_HEIGHT;
    const imageWidth = imageRef.current?.width || 0;
    const imageHeight = imageRef.current?.height || 0;

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

    // Aplicăm limitele
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
  };

  // Funcția pentru crearea și încărcarea story-ului
  const handleCreateStory = async () => {
    if (!user || !selectedFile || !canvasRef.current) {
      setError("Missing required data to create story");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Creăm un canvas pentru a captura imaginea cu efect blur
      const canvas = document.createElement("canvas");
      canvas.width = STORY_WIDTH;
      canvas.height = STORY_HEIGHT;
      const ctx = canvas.getContext("2d");

      if (!ctx || !imageRef.current) {
        throw new Error("Failed to create image context");
      }

      // Mai întâi desenăm imaginea blur pentru fundal
      // (imaginea scalată pentru a umple întregul canvas, aplicăm blur)
      ctx.filter = "blur(15px) brightness(0.7)";

      // Calculăm dimensiunile pentru fundal (întotdeauna să umple întreg canvas-ul)
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

      // Desenăm fundalul blur
      ctx.drawImage(imageRef.current, bgX, bgY, bgWidth, bgHeight);

      // Apoi desenăm imaginea principală transformată
      ctx.filter = "none";

      // Calculăm dimensiunile și poziția imaginii principale
      let mainWidth, mainHeight, mainX, mainY;

      if (imgRatio > STORY_RATIO) {
        // Imaginea e mai înaltă decât ratio-ul de story
        mainWidth = STORY_WIDTH;
        mainHeight = mainWidth * imgRatio;
      } else {
        // Imaginea e mai lată decât ratio-ul de story
        mainHeight = STORY_HEIGHT;
        mainWidth = mainHeight / imgRatio;
      }

      // Aplicăm scalarea
      mainWidth *= scale;
      mainHeight *= scale;

      // Centrăm imaginea și aplicăm poziționarea
      mainX = (STORY_WIDTH - mainWidth) / 2 + position.x;
      mainY = (STORY_HEIGHT - mainHeight) / 2 + position.y;

      // Desenăm imaginea principală
      ctx.drawImage(imageRef.current, mainX, mainY, mainWidth, mainHeight);

      // Convertim canvas-ul în blob
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

      // Convertim blob-ul într-un File
      const processedFile = new File([blob], "story.jpg", {
        type: "image/jpeg",
      });

      // Încărcăm File-ul în Cloudinary
      const uploadResponse = await uploadFile(processedFile);

      // Creăm story-ul
      await createStory({
        userId: user._id,
        image: uploadResponse.secure_url,
        caption: caption.trim() || undefined,
      });

      // Resetăm și închidem
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");

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
    <div className="relative bg-black rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="relative z-20 p-4 flex justify-between items-center border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Create Story</h2>
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>
      </div>

      {/* Canvas principal */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-gray-900">
        {previewUrl ? (
          <div className="relative w-full h-full">
            {/* Canvas pentru editare */}
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
              {/* Imagine blur pentru fundal */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-50"
                style={{ backgroundImage: `url(${previewUrl})` }}
              ></div>

              {/* Imagine principală */}
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
                  }}
                />
              </div>

              {/* Instrucțiuni de editare */}
              <div className="absolute top-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded-lg">
                Move the image with drag & drop. Use controls below to zoom
                in/out.
              </div>
            </div>

            {/* Controale pentru editare */}
            <div className="absolute z-10 bottom-4 left-0 right-0 flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleZoomOut}
                className="p-3 bg-black bg-opacity-70 rounded-full text-white"
              >
                <FaSearchMinus />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleZoomIn}
                className="p-3 bg-black bg-opacity-70 rounded-full text-white"
              >
                <FaSearchPlus />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetTransformations}
                className="p-3 bg-black bg-opacity-70 rounded-full text-white"
              >
                <FaUndoAlt />
              </motion.button>
            </div>

            {/* Câmp pentru caption */}
            <div className="absolute z-10 bottom-20 left-0 right-0 px-4">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full p-3 rounded-lg bg-black bg-opacity-70 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                <FaPlus className="text-white text-2xl" />
              </div>
              <p className="text-white text-lg">
                Select an image for your story
              </p>
              <p className="text-gray-400 text-sm mt-2">
                For best results, use an image with 9:16 aspect ratio
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Select Image
            </motion.button>

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

      {/* Footer cu butoane */}
      {previewUrl && (
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-between">
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
              setCaption("");
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>

          <button
            onClick={handleCreateStory}
            disabled={isUploading}
            className={`px-6 py-2 rounded-lg flex items-center ${
              isUploading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/30"
            } text-white transition-all duration-300`}
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" /> Create Story
              </>
            )}
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-16 left-0 right-0 mx-auto p-3 bg-red-500 text-white text-center rounded-lg max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default StoryEditor;
