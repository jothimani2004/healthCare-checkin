import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loginInput, setloginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false); // Track if the account is locked
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:5000/login',
        { loginInput, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log('Login successful');
        navigate('/mentalhealthcheckin');
      }
    } catch (err) {
      if (err.response?.data?.message === 'Account locked. Please try again later or reset your password.') {
        setAccountLocked(true); // Show lockout modal
      } else {
        setError(err.response?.data?.message || 'Invalid username or password');
      }
    }
  };

  const handleForgotPasswordClick = () => {
   
    // Reset the account locked state before opening the modal
    setAccountLocked(false);
    setShowForgotPasswordModal(true);
  
  };


  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // Start loading

    try {
      const response = await axios.post('http://localhost:5000/forgot-password', { email: emailForReset });

      if (response.status === 200) {
        setResetLinkSent(true);
        setEmailForReset('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-2" htmlFor="usernameOrEmail">
              Username or Email
            </label>
            <input
              type="text"
              id="loginInput"
              value={loginInput}
              onChange={(e) => setloginInput(e.target.value.trim())}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your username or email"
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-600 font-medium mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>
          <button
  type="submit"
  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
  disabled={loading} // Disable the button when loading is true
>
  {loading ? (
    <span className="flex justify-center items-center">
      <svg
        className="w-5 h-5 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" stroke="gray" strokeWidth="4" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 12a8 8 0 0116 0"
        />
      </svg>
      <span className="ml-2">Logging In...</span>
    </span>
  ) : (
    'Login'
  )}
</button>

        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>

        {/* Forgot Password Link */}
        <div className="text-center mt-4">
          <a
            href="#"
            onClick={() => setShowForgotPasswordModal(true)}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2" htmlFor="emailForReset">
                  Enter your email address
                </label>
                <input
                  type="email"
                  id="emailForReset"
                  value={emailForReset}
                  onChange={(e) => setEmailForReset(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex justify-center items-center">
                    <svg
                      className="w-5 h-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" stroke="gray" strokeWidth="4" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 12a8 8 0 0116 0"
                      />
                    </svg>
                    <span className="ml-2">Sending...</span>
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {resetLinkSent && (
              <div className="mt-4 text-center text-green-500">
                <p>The reset link has been sent to your email!</p>
              </div>
            )}

            <div className="text-center mt-4">
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-blue-500 hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Locked Modal */}
      {accountLocked && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Account Locked</h2>
            <p className="text-center text-gray-600 mb-4">
              Your account has been locked due to too many failed login attempts. Please wait for 10 minutes or reset your password.
            </p>
            <div className="flex justify-center space-x-4">
            <button
   onClick={()=>handleForgotPasswordClick()}  
  className="w-32 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
>

                Reset password
              </button>
              <button
                onClick={() => setAccountLocked(false)}
                className="w-32 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
