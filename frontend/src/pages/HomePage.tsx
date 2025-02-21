import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />

      {/* Content */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl p-8 text-center mx-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Homepage! 🎉
        </h1>
        <p className="text-gray-600">You have successfully logged in!</p>
      </div>
    </div>
  );
};

export default HomePage;
