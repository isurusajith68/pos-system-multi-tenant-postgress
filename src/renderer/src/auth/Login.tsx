import React, { useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import logo from "../assets/logo.png";

const LoginComponent: React.FC = () => {
  const { login, isLoading } = useCurrentUser();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!credentials.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await login(credentials.email, credentials.password);
    if (!success) {
      setErrors({ password: "Invalid email or password" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24  flex items-center justify-center  mb-4">
            <img
              src={logo}
              alt="Zentra Logo"
              className="h-24 w-24 rounded-full bg-white shadow-lg"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Welcome to Zentra</h2>
          <p className="mt-2 text-sm text-blue-100">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-11 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">📧</span>
                </div>
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-11 pr-11 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600">
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500"
                  onClick={() => alert("Contact your administrator to reset password")}
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* Login Instructions */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">Login Information:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Default Admin: admin@posystem.com / admin123</p>
              <p>Or use your employee email and password</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-blue-100">© 2025 Zentra. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;