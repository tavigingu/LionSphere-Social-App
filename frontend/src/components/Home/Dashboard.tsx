import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/AuthStore";
import RegularDashboard from "./RegularDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect admin to admin statistics page only on /home or initial load
  useEffect(() => {
    if (
      user?.role === "admin" &&
      location.pathname === "/home" &&
      !location.pathname.startsWith("/profile") &&
      !location.pathname.startsWith("/admin/profile")
    ) {
      navigate("/admin/statistics");
    }
  }, [user, navigate, location.pathname]);

  if (!user) return null;

  // Render appropriate dashboard based on user role
  return user.role === "admin" ? <AdminDashboard /> : <RegularDashboard />;
};

export default Dashboard;
