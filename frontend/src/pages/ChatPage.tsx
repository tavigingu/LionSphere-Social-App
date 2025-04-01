import React from "react";
import { useNavigate } from "react-router-dom";
import Background from "../components/Home/Background";
import Dashboard from "../components/Home/Dashboard";
import ChatContainer from "../components/Chat/ChatContainer";
import useAuthStore from "../store/AuthStore";

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="p-8 rounded-lg bg-white shadow-md">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-gray-800">
      <Background />

      <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
        <ChatContainer />
      </div>

      <Dashboard />
    </div>
  );
};

export default ChatPage;
