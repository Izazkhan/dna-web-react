// src/components/Sidebar.jsx
import { Link, useMatch } from "react-router-dom";

const ActiveLink = ({ to, children, ...props }) => {
  const match = useMatch({ path: to, end: true });
  return (
    <Link to={to} className={`nav-link ${match ? "active" : ""}`} {...props}>
      {children}
    </Link>
  );
};

export default function Sidebar() {
  const menuItems = [
    { to: "/adcampaigns", icon: "bi-card-list", label: "My Campaigns" },
    { to: "/influencers", icon: "bi-person", label: "Influencers" },
    { to: "/agreements", icon: "bi-pencil-square", label: "Agreements" },
    { to: "/payments", icon: "bi-coin", label: "Payments" },
  ];

  return (
    <aside
      className="app-sidebar bg-body-secondary shadow"
      data-bs-theme="dark"
    >
      <div className="sidebar-brand">
        <Link to="/adcampaigns" className="brand-link">
          <img
            src="/images/dna-primary-logo.png"
            alt="AdminLTE Logo"
            className="brand-image opacity-75 shadow"
          />
          <span className="brand-text fw-light">DnaForInsta</span>
        </Link>
      </div>
      <div className="sidebar-wrapper">
        <nav className="mt-2">
          <ul
            className="nav sidebar-menu flex-column"
            role="navigation"
            aria-label="Main navigation"
            data-accordion="false"
            id="navigation"
          >
            {menuItems.map((item) => (
              <li key={item.to} className="nav-item">
                <ActiveLink to={item.to}>
                  <i className={`nav-icon bi ${item.icon}`}></i>
                  <p>{item.label}</p>
                </ActiveLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
