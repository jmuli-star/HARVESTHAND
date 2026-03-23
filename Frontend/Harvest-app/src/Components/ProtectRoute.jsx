import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role'); // Ensure this is exactly what's in DB
  const location = useLocation();

  // Debugging logs - Watch these in the Chrome Console!
  console.log("--- Security Check ---");
  console.log("Path:", location.pathname);
  console.log("Role in Storage:", userRole);
  console.log("Allowed for this Page:", allowedRoles);

  // 1. Authentication Check
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authorization Check
  // Note: We trim and lowercase to be extra safe
  const isAuthorized = allowedRoles.some(role => 
    role.trim().toLowerCase() === (userRole || "").trim().toLowerCase()
  );

  if (!isAuthorized) {
    console.error("⛔ ACCESS DENIED: User role does not match page requirements.");
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Success
  return children;
};

export default ProtectedRoute;