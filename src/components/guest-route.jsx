// components/GuestRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/use-auth";

export default function GuestRoute({ children }) {
  const { auth } = useAuth();

  // If logged in → redirect
  if (auth?.isAuthenticated) {
    return <Navigate to={"/adcampaigns"} replace />;
  }
  return <Outlet />;
}
