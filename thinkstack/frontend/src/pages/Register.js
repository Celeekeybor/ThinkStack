// src/pages/Register.js (FINAL - Updated for React Router)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // <-- IMPORT useNavigate and Link

// FIX #1: The component no longer needs the 'setActiveTab' prop
const Register = ({ showAlert }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Challenger', // Default to Challenger
  });
  
  // FIX #2: Initialize the navigate function from React Router
  const navigate = useNavigate();
  const { name, email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', { name, email, password, role });
      
      showAlert('success', 'Registration successful! Please log in.');
      
      // FIX #3: Use navigate() with the correct URL path to redirect
      navigate('/login');

    } catch (err) {
      console.error('Registration Error:', err);
      let message;
      if (err.response) {
        if (err.response.status === 404) {
          message = 'Cannot connect to the server. Is the backend running?';
        } else {
          message = err.response.data.error || 'An unexpected error occurred.';
        }
      } else {
        message = 'Network Error. Please check your connection or the server status.';
      }
      showAlert('danger', message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4">
            <div className="card-body">
              <h1 className="text-center card-title mb-4">Create Your Account</h1>
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name / Organization</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="e.g., Ada Lovelace"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={password}
                    onChange={onChange}
                    minLength="6"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">I am a...</label>
                  <select className="form-select" name="role" value={role} onChange={onChange}>
                      <option value="Challenger">Challenger (I have a challenge)</option>
                      <option value="Solver">Solver (I want to solve challenges)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-3">Register</button>
              </form>
              <div className="text-center mt-4">
                <p className="text-muted">
                  Already have an account?{' '}
                  {/* FIX #4: Replace the <a> tag with React Router's <Link> component */}
                  <Link to="/login">Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;