import { Link } from "react-router-dom";
import LogoutButton from "./logout-button";
import useAuth from "../hooks/use-auth";

export default function Header() {
  const { auth } = useAuth();
  return (
    <nav
      className="app-header navbar navbar-expand bg-body"
      id="navigation"
      tabIndex="-1"
    >
      <div className="container-fluid">
        <ul className="navbar-nav" role="navigation" aria-label="Navigation 1">
          <li className="nav-item">
            <a
              className="nav-link"
              data-lte-toggle="sidebar"
              href="#"
              role="button"
            >
              <i className="bi bi-list"></i>
            </a>
          </li>
        </ul>

        <ul
          className="navbar-nav ms-auto"
          role="navigation"
          aria-label="Navigation 2"
        >
          <li className="nav-item dropdown user-menu">
            <a
              href="#"
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <span className="d-none d-md-inline">{auth?.user?.name}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
              <li className="user-header text-bg-primary">
                <p>{auth.user.name}</p>
              </li>
              <li className="user-footer">
                <Link to="/profile" className="btn btn-default btn-flat">
                  Profile
                </Link>
                <LogoutButton />
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
