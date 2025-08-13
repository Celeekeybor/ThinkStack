// src/pages/AdminLogin.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ showAlert }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password,
      });

      const user = res.data.user;

      if (user.role !== 'ADMIN') {
        showAlert('You are not authorized as an admin.', 'danger');
        return;
      }

      showAlert('Login successful!', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      showAlert(
        err.response?.data?.error || 'Admin login failed. Please try again.',
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '450px' }}>
      <h2 className="mb-4 text-center">Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="adminEmail" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="adminEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label htmlFor="adminPassword" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="adminPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
