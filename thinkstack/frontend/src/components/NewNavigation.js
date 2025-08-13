import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // <-- Use NavLink for active styles
import { useAuth } from './AuthProvider';

const NewNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };
  
  // Decide which dashboard to link to
  const dashboardPath = user?.role === 'CHALLENGER' ? '/challenger-dashboard' : '/solver-dashboard';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">ThinkStack</NavLink>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/challenges">Challenges</NavLink>
            </li>
            {/* ... other links ... */}
          </ul>
          <div className="d-flex align-items-center">
            {user ? (
              <>
                <button className="btn btn-outline-secondary me-2" onClick={() => navigate(dashboardPath)}>Dashboard</button>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline-primary me-2" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NewNavigation;