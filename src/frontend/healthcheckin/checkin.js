import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import Login from '../authentication/login';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const MentalHealthCheckin = () => {
  const [formData, setFormData] = useState({
    mood: 5,
    stressLevel: 5,
    feelings: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');

  // Fetch the username from the backend when the component mounts
  useEffect(() => {
    const fetchUsername = async () => {
     try{ 
      const response = await fetch('http://localhost:5000/get-username', {
        method: 'GET',
        credentials: 'include', // Include cookies with the request
      });

      if (response.ok) {
        const data = await response.json();
      
        setUsername(data.username); // Set the username from the response
      } else {
        setError('Failed to fetch username');
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      setError('Error fetching username');
    }
  };

    fetchUsername();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.feelings) {
      setError('Please write about your feelings.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/mental-health-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData }),
        credentials: 'include',  // Include cookies in the request
      });
      
     
      if (response.ok) {
        setSuccess('Your mental health check-in has been submitted successfully.');
        setError('');
        setFormData({
          mood: 5,
          stressLevel: 5,
          feelings: '',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        setError('Failed to submit the form. Please try again.');
        setSuccess('');
      }
    } catch (err) {
      setError('An error occurred while submitting the form.');
      setSuccess('');
    }
  };

  return (
    <>

    <Navbar />
   
    <div className="flex items-center justify-center h-screen bg-gray-100">
        
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Daily Mental Health Check-in
        </h2>

        {/* Display Username */}
        {username  && (
          <div className="mb-4 text-center text-lg text-gray-600">
            <p>Welcome, {username}!</p>
          </div>
        )}

        {/* Mental Health Check-in Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="mood" className="block mb-2 text-sm font-medium text-gray-600">
              Mood Rating (1 to 10) <span className="text-red-500">*</span>
            </label>
            <input
              type="range"
              id="mood"
              name="mood"
              min="1"
              max="10"
              value={formData.mood}
              onChange={handleChange}
              className="w-full"
            />
            <div className="text-center">{formData.mood}</div>
          </div>

          {/* Stress Level */}
          <div className="mb-4">
            <label htmlFor="stressLevel" className="block mb-2 text-sm font-medium text-gray-600">
              Stress Level (1 to 10) <span className="text-red-500">*</span>
            </label>
            <input
              type="range"
              id="stressLevel"
              name="stressLevel"
              min="1"
              max="10"
              value={formData.stressLevel}
              onChange={handleChange}
              className="w-full"
            />
            <div className="text-center">{formData.stressLevel}</div>
          </div>

          <div className="mb-4">
            <label htmlFor="feelings" className="block mb-2 text-sm font-medium text-gray-600">
              How are you feeling? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feelings"
              name="feelings"
              value={formData.feelings}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Write about your feelings..."
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-600">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* {error && <p className="mb-4 text-sm text-red-500">{error}</p>} */}
          {success && <p className="mb-4 text-sm text-green-500">{success}</p>}

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            Submit Check-in
          </button>
        </form>
      </div>
    </div>

    </>
  );

};

export default MentalHealthCheckin;
