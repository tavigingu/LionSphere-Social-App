import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/AuthStore";
import { useState, useEffect } from "react";
import LoginForm from "../components/loginForm";
import RegisterForm from "../components/registerForm";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

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
