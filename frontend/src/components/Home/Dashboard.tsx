import React, { useState } from "react";
import {
  FaHome,
  FaSearch,
  FaEnvelope,
  FaBell,
  FaPlusCircle,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import useAuthStore from "../../store/AuthStore";

const Dashboard: React.FC = () => {
  const { logout } = useAuthStore();
  const [activeButton, setActiveButton] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleClick = (buttonName: string) => {
    console.log("Button clicked:", buttonName);
    setActiveButton(buttonName);
    setMobileMenuOpen(false); // Închide meniul mobil când se selectează un buton
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Funcție pentru a determina dimensiunea iconițelor
  const getIconSize = (buttonName: string) => {
    return activeButton === buttonName ? 24 : 20;
  };

  // Funcție pentru a determina grosimea iconițelor
  const getIconClass = (buttonName: string) => {
    return `mr-4 ${
      activeButton === buttonName ? "text-blue-600" : "text-blue-500"
    } transition-all duration-200`;
  };

  // Componenta buton pentru a evita duplicarea codului
  const NavButton = ({ name, icon, label }) => (
    <button
      onClick={() => handleClick(name)}
      className={`flex items-center w-full p-3 text-left rounded-lg transition-all duration-200 ${
        activeButton === name
          ? "font-bold text-blue-600 bg-blue-50"
          : "font-normal text-gray-700 hover:bg-gray-100"
      }`}
      style={{ cursor: "pointer" }}
    >
      {icon}
      <span className="flex-1">{label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile menu toggle - vizibil doar pe dispozitive mobile */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white p-2 rounded-full shadow-md text-blue-600"
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Dashboard - afișare diferită pe mobile vs desktop */}
      <div
        className={`bg-white shadow-xl overflow-y-auto overflow-x-hidden transition-all duration-300 z-40
          ${
            mobileMenuOpen
              ? "fixed inset-0 p-4" // Fullscreen pe mobile când e deschis
              : "fixed -right-80 top-0 bottom-0 w-80 p-4 lg:right-0" // Ascuns pe mobile, vizibil pe desktop
          } 
          lg:w-80 lg:p-4 lg:fixed lg:right-0 lg:top-0 lg:bottom-0 flex flex-col`}
      >
        {/* Mobile header cu buton de închidere - doar pe mobile */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-dancing">
            LionSphere
          </h1>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Desktop Title - ascuns pe mobile */}
        <div className="hidden lg:block mb-8 p-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-dancing">
            LionSphere
          </h1>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2">
          <NavButton
            name="home"
            icon={
              <FaHome
                className={getIconClass("home")}
                size={getIconSize("home")}
              />
            }
            label="Home"
          />

          <NavButton
            name="search"
            icon={
              <FaSearch
                className={getIconClass("search")}
                size={getIconSize("search")}
              />
            }
            label="Search"
          />

          <NavButton
            name="messages"
            icon={
              <FaEnvelope
                className={getIconClass("messages")}
                size={getIconSize("messages")}
              />
            }
            label="Messages"
          />

          <NavButton
            name="notifications"
            icon={
              <FaBell
                className={getIconClass("notifications")}
                size={getIconSize("notifications")}
              />
            }
            label="Notifications"
          />

          <NavButton
            name="create"
            icon={
              <FaPlusCircle
                className={getIconClass("create")}
                size={getIconSize("create")}
              />
            }
            label="Create"
          />

          <NavButton
            name="profile"
            icon={
              <FaUser
                className={getIconClass("profile")}
                size={getIconSize("profile")}
              />
            }
            label="Profile"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Logout Button */}
        <button
          onClick={() => {
            handleClick("logout");
            handleLogout();
          }}
          className={`flex items-center w-full p-3 text-left rounded-lg transition-all duration-200 mt-auto ${
            activeButton === "logout"
              ? "font-bold text-red-600 bg-red-50"
              : "font-normal text-red-600 hover:bg-red-50"
          }`}
          style={{ cursor: "pointer" }}
        >
          <FaSignOutAlt
            className={`mr-4 transition-all duration-200 ${
              activeButton === "logout" ? "scale-110" : ""
            }`}
            size={getIconSize("logout")}
          />
          Log out
        </button>
      </div>

      {/* Overlay pentru a închide meniul pe mobile când se face click în afara lui */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
