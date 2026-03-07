import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { APP_NAME, NAV_LINKS } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/icons/logo.svg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "EV";

  return (
    <header className={`navbar ${menuOpen ? "navbar-menu-open" : ""}`}>
      <div className="navbar-inner">
        <div className="navbar-brand">
          <img src={logo} alt={APP_NAME} className="navbar-logo" />
          <div>
            <div className="navbar-title">
              Event<span className="navbar-accent">Flow</span>
            </div>
            <div className="text-sm text-muted">Plan. Host. Discover.</div>
          </div>
        </div>

        <button
          className="navbar-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="navbar-links">
          {NAV_LINKS.map((link) => {
            if (link.requiresAuth && !user) return null;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "navbar-link-active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="navbar-auth">
          {user ? (
            <>
              <div className="navbar-user">
                <span className="navbar-user-initials">{initials}</span>
                <span className="text-sm">
                  {user.name || "Signed in user"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMenuOpen(false);
                navigate("/login");
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;