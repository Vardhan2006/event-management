import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: "user",
  });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const name = credentials.email.split("@")[0] || "EventFlow user";

    login({
      email: credentials.email,
      name,
      id: credentials.email,
      role: credentials.role,
    });

    navigate(credentials.role === "owner" ? "/owner-dashboard" : "/my-bookings");
  };

  return (
    <div className="page">
      <div className="auth-wrapper">
        <form className="form card" onSubmit={handleSubmit}>
          <div className="form-title">Login</div>
          <div className="form-subtitle">
            Sign in to manage your events and registrations.
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={credentials.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="owner">Venue owner</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;