import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Checking auth...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
