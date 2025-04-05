import React, { useState } from "react";
import { motion } from "framer-motion";
import CreatePostModal from "./CreatePostModal";

const CreatePostButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openModal}
        className="fixed bottom-20 right-6 md:bottom-12 md:right-12 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Create new post"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      </motion.button>

      <CreatePostModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default CreatePostButton;
