import React, { useState } from "react";
import { FaExclamationTriangle, FaFlag } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import useAuthStore from "../../store/AuthStore";
import { IPost } from "../../types/PostTypes";

interface PostReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: IPost;
}

const PostReportModal: React.FC<PostReportModalProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const { user } = useAuthStore();
  const [reportText, setReportText] = useState("");
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reportReasons = [
    { id: "inappropriate", label: "Inappropriate Content" },
    { id: "spam", label: "Spam" },
    { id: "harassment", label: "Harassment" },
    { id: "violence", label: "Violence or Dangerous Content" },
    { id: "fake", label: "Fake News or Misinformation" },
    { id: "intellectual", label: "Intellectual Property Violation" },
    { id: "other", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !reportReason ||
      (!reportText.trim() && reportReason === "other") ||
      !user
    )
      return;

    try {
      setSubmitting(true);
      setError(null);

      // Create report
      const response = await axios.post("http://localhost:5001/report/post", {
        userId: user._id,
        postId: post._id,
        postUserId: post.userId,
        reason: reportReason,
        text: reportText.trim() || null,
        type: "post",
      });

      if (response.data.success) {
        setSuccess(true);
        setReportText("");
        setReportReason(null);

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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Report Submitted!
            </h2>
            <p className="text-gray-600">
              Thank you for helping keep LionSphere safe.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaFlag className="text-red-500 mr-2" />
                Report Post
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
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Why are you reporting this post?
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reportReasons.map((reason) => (
                    <button
                      key={reason.id}
                      type="button"
                      className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
                        reportReason === reason.id
                          ? "bg-red-50 border border-red-200 text-red-700"
                          : "border border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                      onClick={() => setReportReason(reason.id)}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>

              {reportReason === "other" && (
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Please provide details
                  </label>
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Explain why you're reporting this post..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required={reportReason === "other"}
                  />
                </div>
              )}

              {reportReason && reportReason !== "other" && (
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Additional comments (optional)
                  </label>
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Add any additional information..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              )}

              {error && (
                <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-2 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !reportReason ||
                    (reportReason === "other" && !reportText.trim())
                  }
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                    submitting ||
                    !reportReason ||
                    (reportReason === "other" && !reportText.trim())
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

export default PostReportModal;
