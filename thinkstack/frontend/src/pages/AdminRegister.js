// src/pages/AdminRegister.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRegister = ({ showAlert }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        ...formData,
        role: 'ADMIN' // 👈 Hardcoded for admin only
      });

      showAlert('Admin registered successfully!', 'success');
      navigate('/admin-login'); // redirect to login page
    } catch (err) {
      showAlert(err.response?.data?.error || 'Registration failed.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '450px' }}>
      <h2 className="mb-4 text-center">Admin Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Admin Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Set Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? 'Registering...' : 'Register Admin'}
        </button>
      </form>
    </div>
  );
};

export default AdminRegister;
