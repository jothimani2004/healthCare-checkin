import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './frontend/authentication/login';
import Register from './frontend/authentication/register';
import ResetPassword from './frontend/authentication/resetpassword';
import MentalHealthCheckin from './frontend/healthcheckin/checkin';
import ViewMentalHealthCheckins from './frontend/healthcheckin/viewcheckin'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
      
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/mentalhealthcheckin" element={<MentalHealthCheckin />} />
        <Route path="/viewhealthcare" element={<ViewMentalHealthCheckins />} />

      </Routes>
    </Router>
  );
}

export default App;
