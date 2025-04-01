import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useChatStore from "../../store/ChatStore";
import useSocketStore from "../../store/SocketStore";
import uploadFile from "../../helpers/uploadFile";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  chatId: string;
  userId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  chatId,
  userId,
}) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { typingIn } = useChatStore();
  const { sendTypingStatus } = useSocketStore();

  // Handle typing indicators
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTyping = typingIn === chatId;

  useEffect(() => {
    return () => {
      // Clear typing status when component unmounts
      if (isTyping) {
        sendTypingStatus(chatId, userId, false);
      }

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, userId, isTyping, sendTypingStatus]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    // Set typing status if not already typing
    if (!isTyping) {
      sendTypingStatus(chatId, userId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(chatId, userId, false);
    }, 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear typing status
    if (isTyping) {
      sendTypingStatus(chatId, userId, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    let messageText = text.trim();

    // Return if no text and no image
    if (!messageText && !image) {
      return;
    }

    if (image) {
      try {
        setIsUploading(true);

        // Upload image
        const result = await uploadFile(image);

        // Add image URL to message
        messageText += ` [Image: ${result.secure_url}]`;

        // Clear image
        setImage(null);
        setImagePreview(null);
      } catch (error) {
        console.error("Failed to upload image:", error);
      } finally {
        setIsUploading(false);
      }
    }

    // Send message
    onSendMessage(messageText);

    // Reset form
    setText("");
    setEmojiPickerVisible(false);

    // Focus input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (unless Shift is pressed for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setText(text + emoji);
    setEmojiPickerVisible(false);

    // Focus input after adding emoji
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative mb-2 inline-block">
          <img
            src={imagePreview}
            alt="Upload preview"
            className="h-20 w-auto rounded-md object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Message form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Emoji picker button */}
        <button
          type="button"
          onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
          className="p-2 text-gray-500 hover:text-yellow-500 transition-colors"
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
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* File input button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Text input */}
        <div className="flex-grow relative">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            ref={inputRef}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isUploading}
          />
        </div>

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={(!text.trim() && !image) || isUploading}
          className={`p-2 rounded-full ${
            (!text.trim() && !image) || isUploading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          } transition-colors`}
          whileTap={{ scale: 0.95 }}
        >
          {isUploading ? (
            <div className="h-6 w-6 border-2 border-white rounded-full border-t-transparent animate-spin" />
          ) : (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </motion.button>
      </form>

      {/* Emoji picker popover */}
      {emojiPickerVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-16 left-4 bg-white rounded-lg shadow-lg p-2 border border-gray-200 z-10"
        >
          <div className="grid grid-cols-8 gap-1">
            {[
              "😀",
              "😂",
              "😍",
              "🥰",
              "😎",
              "🙄",
              "😢",
              "😡",
              "👍",
              "👎",
              "🙏",
              "🎉",
              "❤️",
              "🔥",
              "👋",
              "🤔",
            ].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 text-xl hover:bg-gray-100 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MessageInput;
