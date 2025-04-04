import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnlineIndicatorProps {
  connected: boolean;
}

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ connected }) => {
  const [show, setShow] = useState(false);

  // Show the indicator when connection status changes
  useEffect(() => {
    setShow(true);

    // Hide after 3 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [connected]);

  const statusText = connected ? "Connected" : "Disconnected";
  const statusColor = connected
    ? "from-green-500 to-emerald-600"
    : "from-red-500 to-pink-600";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="px-4 py-2 rounded-full bg-white shadow-md flex items-center border border-purple-100/30">
            <div
              className={`h-3 w-3 rounded-full bg-gradient-to-r ${statusColor} mr-2 animate-pulse`}
            ></div>
            <span className="text-sm font-medium text-gray-800">
              {statusText}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnlineIndicator;
