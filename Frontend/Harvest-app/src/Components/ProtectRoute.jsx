import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // 1. Snatch tokens from URL (Google OAuth Flow)
  const urlAccess = params.get('access');
  const urlRefresh = params.get('refresh');
  const urlRole = params.get('role');

  if (urlAccess) {
    localStorage.setItem('access_token', urlAccess);
    localStorage.setItem('refresh_token', urlRefresh || '');
    localStorage.setItem('user_role', urlRole || '');
    // Clean URL bar without refreshing
    window.history.replaceState(null, null, location.pathname);
  }

  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  // 2. Authentication Check
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authorization Check (Case-insensitive)
  const isAuthorized = allowedRoles.some(role => 
    role.toLowerCase().trim() === (userRole || "").toLowerCase().trim()
  );

  if (!isAuthorized) {
    console.error(`⛔ Unauthorized: Expected ${allowedRoles}, got ${userRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;