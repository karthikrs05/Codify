import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute() {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

