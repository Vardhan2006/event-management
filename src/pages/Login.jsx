import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        user?.role === "owner" ? "/owner-dashboard" : "/my-bookings"
      );
    }
  }, [isAuthenticated, navigate, user?.role]);

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await login(credentials.email, credentials.password);
      const userRole = res.user?.role || "user";
      navigate(userRole === "owner" ? "/owner-dashboard" : "/my-bookings");
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || "Login failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page-container">
      <div className="auth-split-grid">
        {/* Left Info Frame (hidden on mobile via CSS) */}
        <div className="auth-info-frame frame-corner-brackets">
          <div>
            <span className="eyebrow" style={{ color: "var(--ink)", marginBottom: 12 }}>Welcome Back</span>
            <h2 style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 16 }}>
              Manage & Book Spaces Seamlessly
            </h2>
            <p style={{ color: "rgba(10, 10, 11, 0.8)", fontSize: 16 }}>
              Login to continue booking your perfect venue, manage request approvals, and track date reservations.
            </p>
          </div>

          <div className="stack-sm" style={{ marginTop: 40, background: "rgba(255,255,255,0.6)", padding: 20, borderRadius: "var(--radius-card)", border: "1px solid var(--ink)" }}>
            <span className="eyebrow" style={{ color: "var(--ink)" }}>Quick Tip</span>
            <p className="text-sm" style={{ color: "var(--ink)", fontWeight: 500 }}>
              Venue owners can manage listings, inspect incoming requests, and update calendar availability directly from the Owner Dashboard.
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-card">
          <div>
            <span className="eyebrow">Account Access</span>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>Log In</h1>
            <p className="text-muted text-sm">Enter your credentials below to access your account.</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form className="stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className="input"
                placeholder="you@example.com"
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="input"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
              style={{ marginTop: 8 }}
            >
              {submitting ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div style={{ textAlign: "center", paddingTop: 12, borderTop: "1px solid var(--line-soft)" }}>
            <p className="text-sm text-muted">
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;