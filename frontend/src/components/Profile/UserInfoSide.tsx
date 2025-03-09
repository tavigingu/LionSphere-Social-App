import React from "react";
import { IUser } from "../../types/AuthTypes";
import { FaBriefcase, FaMapMarkerAlt, FaGraduationCap } from "react-icons/fa";

interface UserInfoSidebarProps {
  user: IUser | null;
}

const UserInfoSidebar: React.FC<UserInfoSidebarProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-6">
        <p className="text-gray-500 text-center">Loading user information...</p>
      </div>
    );
  }

  const hasDetails = user.worksAt || user.occupation || user.city;

  return (
    <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">About</h3>

      {!hasDetails && (
        <p className="text-gray-500 italic">
          No additional information available.
        </p>
      )}

      {user.worksAt && (
        <div className="flex items-center mb-4">
          <FaBriefcase className="text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Works at</p>
            <p className="text-gray-800">{user.worksAt}</p>
          </div>
        </div>
      )}

      {user.occupation && (
        <div className="flex items-center mb-4">
          <FaGraduationCap className="text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Occupation</p>
            <p className="text-gray-800">{user.occupation}</p>
          </div>
        </div>
      )}

      {user.city && (
        <div className="flex items-center mb-4">
          <FaMapMarkerAlt className="text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Lives in</p>
            <p className="text-gray-800">{user.city}</p>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          Profile Overview
        </h3>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Username:</span> {user.username}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Full name:</span> {user.firstname}{" "}
          {user.lastname}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Email:</span> {user.email}
        </p>
        {user.createdAt && (
          <p className="text-gray-600 text-sm mt-4">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserInfoSidebar;
