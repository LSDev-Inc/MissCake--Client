import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false, ownerOnly = false }) => {
  const { isAuthenticated, isStaff, isOwner, authLoading } = useAuth();

  if (authLoading) {
    return <div className="page-container py-10">Caricamento...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isStaff) {
    return <Navigate to="/" replace />;
  }

  if (ownerOnly && !isOwner) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
