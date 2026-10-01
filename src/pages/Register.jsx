import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await register(formData);
      const userRole = res.user?.role || "user";
      navigate(userRole === "owner" ? "/owner-dashboard" : "/my-bookings");
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || "Registration failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page-container">
      <div className="auth-split-grid">
        {/* Left Info Frame (hidden on mobile via CSS) */}
        <div className="auth-info-frame frame-corner-brackets" style={{ background: "var(--card-green-bg)" }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--ink)", marginBottom: 12 }}>Join EventFlow</span>
            <h2 style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 16 }}>
              Start Booking or Listing Venues Today
            </h2>
            <p style={{ color: "rgba(10, 10, 11, 0.8)", fontSize: 16 }}>
              Sign up to list your venue properties, compare space amenities, check real-time availability, and request date reservations.
            </p>
          </div>

          <div className="stack-sm" style={{ marginTop: 40, background: "rgba(255,255,255,0.6)", padding: 20, borderRadius: "var(--radius-card)", border: "1px solid var(--ink)" }}>
            <span className="eyebrow" style={{ color: "var(--ink)" }}>Two Roles Available</span>
            <p className="text-sm" style={{ color: "var(--ink)", fontWeight: 500 }}>
              Choose <strong>Customer</strong> to search & book spaces for your events, or <strong>Owner</strong> to list and monetize your venues.
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-card">
          <div>
            <span className="eyebrow">Get Started</span>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>Create Account</h1>
            <p className="text-muted text-sm">Fill in your information to set up your account.</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form className="stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                className="input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className="input"
                placeholder="you@example.com"
                value={formData.email}
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
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <span className="eyebrow">I Want To</span>
              <div className="segmented-control">
                <label className="segmented-option">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === "user"}
                    onChange={handleChange}
                  />
                  <span className="segmented-label">Book Venues</span>
                </label>
                <label className="segmented-option">
                  <input
                    type="radio"
                    name="role"
                    value="owner"
                    checked={formData.role === "owner"}
                    onChange={handleChange}
                  />
                  <span className="segmented-label">List Venues</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
              style={{ marginTop: 8 }}
            >
              {submitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div style={{ textAlign: "center", paddingTop: 12, borderTop: "1px solid var(--line-soft)" }}>
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
                Already have an account? Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
