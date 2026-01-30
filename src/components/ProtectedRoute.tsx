import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { ReactNode } from "react";
import { hasPermission } from "@/lib/permissions";

type Props = {
  children: ReactNode;
  allowedRoles?: Array<"student" | "organizer" | "volunteer" | "admin">;
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { isAuthenticated, loading, currentUser } = useAuth();

  if (loading) return <div>Checking auth...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = currentUser?.role;
  if (!hasPermission(role, allowedRoles)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
