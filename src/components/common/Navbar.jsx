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
    <header className="navbar-header">
      <div className="container navbar-container">
        <NavLink to="/" className="navbar-brand">
          <img src={logo} alt={APP_NAME} style={{ width: 28, height: 28 }} />
          <span>
            Event<span style={{ color: "var(--muted)" }}>Flow</span>
          </span>
        </NavLink>

        <nav className="navbar-nav">
          {NAV_LINKS.map((link) => {
            if (link.requiresAuth && !user) return null;
            if (link.role && link.role !== user?.role) return null;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="row" style={{ gap: 12 }}>
              <div className="row" style={{ gap: 8, padding: "4px 12px", background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-pill)" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--ink)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                  {initials}
                </span>
                <span className="text-sm text-ink" style={{ fontWeight: 600 }}>
                  {user.name || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                type="button"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/register");
                }}
              >
                Register
              </button>
            </div>
          )}

          <button
            className="mobile-menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu-drawer open">
          <nav className="stack" style={{ gap: 12 }}>
            {NAV_LINKS.map((link) => {
              if (link.requiresAuth && !user) return null;
              if (link.role && link.role !== user?.role) return null;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;