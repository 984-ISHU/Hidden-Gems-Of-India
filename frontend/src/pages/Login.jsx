import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../lib/api"
import { useAuth } from "../lib/AuthContext"

const Login = () => {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user, login, logout } = useAuth()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        // Validate required fields
        if (!username || !email || !password) {
          throw new Error("Username, email and password are required");
        }

        // Attempt signup
        const signupData = {
          username: username.trim(),
          email: email.trim(),
          password: password,
          user_type: "artisan"
        };

        console.log('Attempting signup with:', { ...signupData, password: '***' });
        
        await api.signup(signupData);
      }

      // Proceed with login
      console.log('Attempting login with:', email);
      await login({ 
        email: email.trim(), 
        password 
      });

      console.log('Login successful, redirecting to dashboard');
      navigate("/dashboard");

    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      setError(err.response?.data?.detail || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Hello, {user.email}</p>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-800">{user.email}</span>
              </div>
              {user.username && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Username:</span>
                  <span className="text-gray-800">{user.username}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg"
            >
              Go to Homepage
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignup ? "Join Us" : "Welcome Back"}
          </h1>
          <p className="text-orange-100">
            {isSignup ? "Create your artisan account" : "Sign in to your account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Error: {error}
              </div>
            </div>
          )}

          {/* Username Input (Signup only) */}
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignup}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200 bg-gray-50"
              />
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200 bg-gray-50"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200 bg-gray-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please wait...
              </div>
            ) : (
              isSignup ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        {/* Toggle Form Type */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignup((prev) => !prev)}
            className="text-teal-600 hover:text-teal-700 font-semibold transition-colors duration-200"
          >
            {isSignup 
              ? "Already have an account? Sign In" 
              : "New here? Create Account"
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login