import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');
  const location = useLocation();

  // Debugging logs (Check your browser console!)
  console.log("--- Protected Route Check ---");
  console.log("Token exists:", !!token);
  console.log("Stored User Role:", userRole);
  console.log("Required Roles for this path:", allowedRoles);

  // 1. If no token, the user is not logged in
  if (!token) {
    // We save the current location so we can redirect them back after they login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Authorization Check
  // We use .toLowerCase() to prevent "Access Denied" caused by simple typing cases
  const isAuthorized = allowedRoles.some(role => 
    role.toLowerCase() === (userRole || "").toLowerCase()
  );

  if (allowedRoles && !isAuthorized) {
    console.error("ACCESS DENIED: Role mismatch.");
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. If all checks pass, render the dashboard
  return children;
};

export default ProtectedRoute;
