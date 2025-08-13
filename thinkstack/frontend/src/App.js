// src/App.js (FINAL REVAMPED VERSION)

import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// --- Core & Protected Components ---
import { AuthProvider, useAuth } from './components/AuthProvider';
import NewNavigation  from './components/NewNavigation';
import Alert from './components/Alert';
import ProtectedRoute from './components/ProtectedRoute'; // <-- NEW

// --- Page Components ---
import Home from './pages/Home';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import Leaderboard from './pages/Leaderboard';
import Teams from './pages/Teams';
import AboutUs from './pages/AboutUs';
import SolverDashboard from './pages/SolverDashboard';
import ChallengerDashboard from './pages/ChallengerDashboard';
import CreateChallenge from './pages/CreateChallenge';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import DashboardAdmin from './pages/DashboardAdmin'; // <-- NEW
import NotFound from './pages/NotFound'; // <-- NEW

// --- Global Styles ---
import './App.css';

const App = () => {
  const { loading } = useAuth();
  const [alert, setAlert] = useState(null);
  const location = useLocation(); // Hook to get the current URL path

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  if (loading) {
    return <div className="container mt-5 text-center"><h4>Loading Application...</h4></div>;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* The Navigation component will now read the URL from React Router */}
      <NewNavigation />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      
      <main className="flex-grow-1">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:id" element={<ChallengeDetail showAlert={showAlert} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/about-us" element={<AboutUs />} />
          
          {/* --- Auth Routes --- */}
          <Route path="/login" element={<Login showAlert={showAlert} />} />
          <Route path="/register" element={<Register showAlert={showAlert} />} />
          <Route path="/admin-login" element={<AdminLogin showAlert={showAlert} />} />
          <Route path="/admin-register" element={<AdminRegister showAlert={showAlert} />} />
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />



          {/* --- Protected Routes (Require Login) --- */}
          <Route 
            path="/solver-dashboard" 
            element={<ProtectedRoute roles={['SOLVER']}><SolverDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/challenger-dashboard" 
            element={<ProtectedRoute roles={['CHALLENGER']}><ChallengerDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/create-challenge" 
            element={<ProtectedRoute roles={['CHALLENGER']}><CreateChallenge showAlert={showAlert} /></ProtectedRoute>} 
          />
          <Route 
            path="/teams" 
            element={<ProtectedRoute><Teams /></ProtectedRoute>} 
          />

          {/* --- 404 Not Found Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* The footer is now always visible, except maybe on the homepage if you want to hide it */}
      {location.pathname !== '/' && (
          <footer className="footer-section">
            {/* Your footer JSX here */}
          </footer>
      )}
    </div>
  );
};

// Wrap App with AuthProvider
const AppWithAuth = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuth;