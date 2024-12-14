import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
const ViewMentalHealthCheckins = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [error, setError] = useState('');

  // Fetch check-ins when the component mounts
  useEffect(() => {
    const fetchCheckIns = async () => {
      setError('');
      setCheckIns([]);

      try {
        const response = await fetch('http://localhost:5000/check-ins', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }, credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setCheckIns(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('An error occurred while fetching the data.');
      }
    };

    fetchCheckIns();
  }, []); // Empty dependency array ensures it runs only on component mount

  return (

  <><Navbar />
    
    <div className="container mx-auto p-4">
        
      <h2 className="text-2xl font-bold text-center mb-6">Your Mental Health Check-ins</h2>

      {/* Error message */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Display check-ins */}
      {checkIns.length > 0 ? (
        <div className="space-y-6">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn._id}
              className="p-4 border rounded-lg shadow-md bg-white"
            >
              <p><strong>Date:</strong> {new Date(checkIn.date).toLocaleDateString()}</p>
              <p><strong>Mood:</strong> {checkIn.mood}</p>
              <p><strong>Stress Level:</strong> {checkIn.stressLevel}</p>
              <p><strong>Feelings:</strong> {checkIn.feelings}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No check-ins found for your account.</p>
      )}
    </div>

    </>
  );
};

export default ViewMentalHealthCheckins;
