import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/use-auth";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <a
      href="#"
      onClick={handleLogout}
      className="btn btn-default btn-flat float-end"
    >
      Sign out
    </a>
  );
}
