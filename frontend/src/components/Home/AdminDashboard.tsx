import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaExclamationTriangle,
  FaNewspaper,
  FaSignOutAlt,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/AuthStore";
import Logo from "../../assets/LionSphereLogo.png";
import FullLogo from "../../assets/LionSphere_longlogo.png";

const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("statistics");

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/statistics")) {
      setActiveButton("statistics");
    } else if (path.includes("/admin/users")) {
      setActiveButton("users");
    } else if (path.includes("/admin/reports")) {
      setActiveButton("reports");
    } else if (path.includes("/admin/reported-posts")) {
      setActiveButton("reported-posts");
    }
  }, [location.pathname]);

  useEffect(() => {
    // Redirect to statistics page if admin navigates to home
    if (location.pathname === "/home" && user?.role === "admin") {
      navigate("/admin/statistics");
    }
  }, [location.pathname, navigate, user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleClick = (buttonName: string) => {
    setActiveButton(buttonName);
    setMobileMenuOpen(false);

    switch (buttonName) {
      case "statistics":
        navigate("/admin/statistics");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "reports":
        navigate("/admin/reports");
        break;
      case "reported-posts":
        navigate("/admin/reported-posts");
        break;
      default:
        break;
    }
  };

  interface NavButtonProps {
    name: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }

  const NavButton: React.FC<NavButtonProps> = ({
    name,
    icon,
    label,
    onClick,
  }) => {
    const isActive = activeButton === name;

    return (
      <div className="relative">
        <button
          data-button={name}
          onClick={() => (onClick ? onClick() : handleClick(name))}
          className={`flex items-center w-full p-3 text-left rounded-lg transition-all duration-200 ${
            isActive
              ? "font-bold text-blue-600 bg-blue-50"
              : "font-normal text-gray-700 hover:bg-gray-100"
          }`}
          style={{ cursor: "pointer" }}
        >
          <div className="relative">
            {React.cloneElement(icon as React.ReactElement, {
              className: `${
                isActive ? "text-blue-600" : "text-blue-500"
              } transition-all duration-200 mr-4`,
              size: isActive ? 24 : 20,
            })}
          </div>
          <span className="flex-1">{label}</span>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white p-2 rounded-full shadow-md text-blue-600"
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div
        className={`bg-white shadow-xl overflow-y-auto overflow-x-hidden transition-all duration-300 hover:shadow-2xl z-40 fixed top-0 right-0 bottom-0
          ${
            mobileMenuOpen
              ? "translate-x-0 w-80 sm:w-72 md:w-64"
              : "translate-x-full w-80 sm:w-72 md:w-64 lg:translate-x-0 lg:w-72 xl:w-80"
          }
          flex flex-col p-4 sm:p-3 md:p-3 lg:p-4`}
      >
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <img
            src={FullLogo}
            alt="LionSphere Logo"
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="hidden lg:flex justify-center mb-8 p-2">
          <div className="relative">
            <img
              src={FullLogo}
              alt="LionSphere Long Logo"
              className="h-16 w-auto object-contain"
            />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              Admin
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <NavButton
            name="statistics"
            icon={<FaChartBar />}
            label="Statistics"
          />
          <NavButton name="users" icon={<FaUsers />} label="Users" />
          <NavButton
            name="reports"
            icon={<FaExclamationTriangle />}
            label="Reports"
          />
          <NavButton
            name="reported-posts"
            icon={<FaNewspaper />}
            label="Reported Posts"
          />
        </div>

        {user && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 flex items-center">
            <div className="w-10 h-10 mr-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {user.username?.charAt(0).toUpperCase() || "A"}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center">
                <p className="font-medium text-gray-800 truncate">
                  {user.username}
                </p>
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                  Admin
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <NavButton
            name="logout"
            icon={<FaSignOutAlt />}
            label="Logout"
            onClick={handleLogout}
          />
        </div>

        <div className="mt-2 border-t border-gray-200 pt-2">
          <p className="text-xs text-gray-400 text-center">
            Admin Dashboard v1.0
          </p>
          <p className="text-xs text-gray-300 mt-1 text-center">
            © 2025 LIONSHPERE BY TAVI GINGU
          </p>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default AdminDashboard;
