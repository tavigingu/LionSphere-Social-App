import React, { useState } from "react";
import { FaExclamationTriangle, FaBug, FaRegFrownOpen } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import useAuthStore from "../../store/AuthStore";

interface UserReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserReportModal: React.FC<UserReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuthStore();
  const [reportText, setReportText] = useState("");
  const [category, setCategory] = useState<string>("bug");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() || !category || !user) return;

    try {
      setSubmitting(true);
      setError(null);

      // Create report
      const response = await axios.post("http://localhost:5001/report/issue", {
        userId: user._id,
        text: reportText,
        category: category,
        type: "general",
      });

      if (response.data.success) {
        setSuccess(true);
        setReportText("");
        setCategory("bug");

        // Close the modal after 2 seconds on success
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError(response.data.message || "Failed to submit report");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(
        "An error occurred while submitting your report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl p-6 md:p-8 w-full max-w-md relative z-10"
      >
        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Report Submitted!
            </h2>
            <p className="text-gray-700">
              Thank you for helping us improve LionSphere.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FaExclamationTriangle className="text-amber-500 mr-2" />
                Report a Problem
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-gray-900 text-sm font-medium mb-2">
                  Problem Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      category === "bug"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    onClick={() => setCategory("bug")}
                  >
                    <FaBug className="text-lg mb-1" />
                    <span className="text-xs">Bug</span>
                  </button>
                  <button
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      category === "content"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    onClick={() => setCategory("content")}
                  >
                    <svg
                      className="w-5 h-5 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <span className="text-xs">Content</span>
                  </button>
                  <button
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      category === "feature"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    onClick={() => setCategory("feature")}
                  >
                    <FaRegFrownOpen className="text-lg mb-1" />
                    <span className="text-xs">Feature</span>
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-gray-900 text-sm font-medium mb-2">
                  Describe the Problem
                </label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Please provide details about the issue you're experiencing..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 mr-2 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reportText.trim()}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    submitting || !reportText.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default UserReportModal;
