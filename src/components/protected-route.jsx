import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/use-auth";

function ProtectedRoute() {
  const { auth } = useAuth();

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
