import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State for hamburger menu
  const navigate = useNavigate(); // To navigate programmatically

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status===200) {
       
        navigate("/#/login"); // Redirect to the login page
      } else {
        alert("Failed to log out. Please try again.");
      }
    } catch (err) {
      console.error("Error logging out:", err);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold cursor-pointer" >
              HealthcareCheckin
            </h1>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="flex lg:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isOpen}
            >
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Right Side: Links (Hidden on Mobile) */}
          <div className="hidden lg:flex space-x-4">
            <button
              onClick={() => navigate("/mentalhealthcheckin")}
              className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium"
            >
              Checkin Form
            </button>
            <button
              onClick={() => navigate("/viewhealthcare")}
              className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium"
            >
              Show Daily Checkin
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Visible when isOpen is true) */}
      <div
        className={`lg:hidden ${isOpen ? "block" : "hidden"} bg-blue-700`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-2 pt-2 pb-3">
          <button
            onClick={() => {
              navigate("/mentalhealthcheckin");
              setIsOpen(false);
            }}
            className="block hover:bg-blue-500 px-3 py-2 rounded-md text-base font-medium w-full text-left"
          >
            Checkin Form
          </button>
          <button
            onClick={() => {
              navigate("/viewhealthcare");
              setIsOpen(false);
            }}
            className="block hover:bg-blue-500 px-3 py-2 rounded-md text-base font-medium w-full text-left"
          >
            Show Daily Checkin
          </button>
          <button
            onClick={handleLogout}
            className="block w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-base font-medium text-left"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
