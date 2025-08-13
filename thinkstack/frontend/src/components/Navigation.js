// src/components/Navigation.js (Revamped)

import React from 'react';
import { useAuth } from './AuthProvider';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setActiveTab('home');
  };

  const getDashboardTab = () => {
    if (!user) return 'home';
    return user.role === 'CHALLENGER' ? 'challenger-dashboard' : 'solver-dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#home" onClick={() => setActiveTab('home')}>ThinkStack</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <a className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} href="#home" onClick={() => setActiveTab('home')}>Home</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${activeTab === 'challenges' ? 'active' : ''}`} href="#challenges" onClick={() => setActiveTab('challenges')}>Challenges</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${activeTab === 'leaderboard' ? 'active' : ''}`} href="#leaderboard" onClick={() => setActiveTab('leaderboard')}>Leaderboard</a>
            </li>
             <li className="nav-item">
              <a className={`nav-link ${activeTab === 'about-us' ? 'active' : ''}`} href="#about-us" onClick={() => setActiveTab('about-us')}>About Us</a>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            {user ? (
              <>
                <button className="btn btn-outline-secondary me-2" onClick={() => setActiveTab(getDashboardTab())}>Dashboard</button>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline-primary me-2" onClick={() => setActiveTab('login')}>Login</button>
                <button className="btn btn-primary" onClick={() => setActiveTab('register')}>Register</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;