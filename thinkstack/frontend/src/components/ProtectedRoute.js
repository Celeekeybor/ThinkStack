// src/components/ProtectedRoute.js (NEW FILE)

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // User not logged in, redirect to login page
    // 'replace' prevents them from going back to the protected page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If the route requires a specific role, check it
  if (roles && !roles.includes(user.role)) {
      // User does not have the required role, redirect to home
      return <Navigate to="/" replace />;
  }

  // User is logged in and has the correct role, render the component
  return children;
};

export default ProtectedRoute;