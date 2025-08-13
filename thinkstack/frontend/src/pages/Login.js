// src/pages/Login.js (Revamped)


import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom'; // <-- IMPORT

const Login = ({ showAlert }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate(); // <-- Initialize the navigate function
  const location = useLocation(); // To check if we were redirected from another page
  const from = location.state?.from?.pathname || null;

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/login', 
        { email, password },
        { withCredentials: true }
      );
      const user = response.data.user;
      login(user); 
      showAlert('success', `Welcome back, ${user.name}!`);

      // --- THE REAL REDIRECTION LOGIC ---
      if (from) {
          navigate(from, { replace: true }); // Go back to the page you were trying to access
      } else if (user.role === 'CHALLENGER') {
        navigate('/challenger-dashboard', { replace: true }); // Redirect to Challenger dashboard
      } else {
        navigate('/solver-dashboard', { replace: true }); // Redirect to Solver dashboard
      }

    } catch (err) {
      const message = err.response?.data?.error || 'Invalid credentials or server error.';
      showAlert('danger', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4">
            <h1 className="text-center card-title">Login</h1>
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
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
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;