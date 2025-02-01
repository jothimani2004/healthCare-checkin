import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
  const [failedAttempts, setFailedAttempts] = useState(null);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false); 
  const [recaptchaValue, setRecaptchaValue] = useState(null); // State to hold reCAPTCHA response

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRecaptchaChange = (value) => {
    console.log(value);
    
    setRecaptchaValue(value); // Set reCAPTCHA value
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaValue) {
      setError('Please verify that you are not a robot');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/login',
        { loginInput, password, recaptchaToken: recaptchaValue }, // Send reCAPTCHA token to backend
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log('Login successful');
        setFailedAttempts(0);
        navigate('/mentalhealthcheckin');
      }
    } catch (err) {
      if (err.response?.data?.message === 'Account locked. Please try again later or reset your password.') {
        setAccountLocked(true);
      } else {
        setError(err.response?.data?.message || 'Invalid username or password');
        setFailedAttempts(err.response?.data?.failedAttempts || 0);
      }
    }
  };

  const handleForgotPasswordClick = () => {
    setAccountLocked(false);
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

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
              onChange={(e) => setLoginInput(e.target.value.trim())}
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

          {/* reCAPTCHA Widget */}
          <div className="mb-4">
            <ReCAPTCHA
              sitekey="6LdTp8kqAAAAAKD8Jp_RwnX2MKj9NptdGPj3nKWL"
              onChange={handleRecaptchaChange}
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
                <span className="ml-2">Logging In...</span>
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {failedAttempts > 0 && (
          <p style={{ color: 'red' }}>
            Failed Attempts: {failedAttempts}.
            <p>Your account will be locked after 5 unsuccessful login attempts</p>
          </p>
        )}

        {/* Forgot Password Link */}
        <div className="text-center mt-4">
          <a
            onClick={() => setShowForgotPasswordModal(true)}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
