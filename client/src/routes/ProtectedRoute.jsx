import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If user is not authenticated (0) and not already on the verify-email page
  if (user.authenticated === 0 && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
