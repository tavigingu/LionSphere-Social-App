import { useState } from "react";
import useAuthStore from "../store/AuthStore";
import { RegisterCredentials } from "../types/AuthTypes";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState<RegisterCredentials>({
    username: "",
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      // Redirecționarea va fi gestionată la nivel de rută (PrivateRoute)
    } catch (error) {
      // Eroarea este deja setată în store
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please fill in your information to register
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Enter your first name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Enter your last name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out disabled:opacity-70"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-700"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
