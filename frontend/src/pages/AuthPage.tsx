// frontend/src/pages/AuthPage.tsx
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/AuthStore";
import { useState, useEffect } from "react";
import LoginForm from "../components/Auth/loginForm";
import RegisterForm from "../components/Auth/registerForm";

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Check for initial state from navigation
  const initialRegisterState = location.state?.isRegister || false;
  const [isLogin, setIsLogin] = useState(!initialRegisterState);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
      <div className="absolute inset-0 backdrop-blur-md bg-white/30" />
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {isLogin ? (
          <LoginForm onSwitchToRegister={handleSwitchToRegister} />
        ) : (
          <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
