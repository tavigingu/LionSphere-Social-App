import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginForm from "../components/loginForm.tsx";
import RegisterForm from "../components/registerForm.tsx";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types/authTypes.ts";

const AuthPage: React.FC = () => {
  const loginUrl = "http://localhost:5001/auth/login";
  const registerUrl = "http://localhost:5001/auth/register";
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [loginFormData, setLoginFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const [registerFormData, setRegisterFormData] = useState<RegisterCredentials>(
    {
      username: "",
      email: "",
      password: "",
      firstname: "",
      lastname: "",
    }
  );

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterFormData({
      ...registerFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = isLogin ? loginUrl : registerUrl;
      const data = isLogin ? loginFormData : registerFormData;

      console.log("Submitting data:", data);
      const response = await axios.post<AuthResponse>(url, data, {
        withCredentials: true,
      });

      if (response.data.success) {
        console.log(response.data);
        navigate("/home");
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
      <div className="absolute inset-0 backdrop-blur-md bg-white/30" />
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {isLogin ? (
          <LoginForm
            formData={loginFormData}
            onChange={handleLoginChange}
            onSubmit={handleSubmit}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            formData={registerFormData}
            onChange={handleRegisterChange}
            onSubmit={handleSubmit}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
