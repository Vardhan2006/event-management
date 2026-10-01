import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/common/Loader";
import BookingCard from "../components/bookings/BookingCard";
import { useAuth } from "../context/AuthContext";
import bookingService from "../services/bookingService";

const STATUS_TABS = [
  { value: "", label: "All Requests" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function MyBookings() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const loadBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError("");

      const queryParams = {};
      if (statusFilter) queryParams.status = statusFilter;

      const data = await bookingService.getUserBookings(queryParams);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || "We couldn't load your bookings right now.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    setError("");
    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || "We couldn't cancel this booking.";
      setError(msg);
    }
  };

  return (
    <div className="container stack-lg" style={{ paddingTop: 40, paddingBottom: 64 }}>
      {/* Header */}
      <div className="row-between">
        <div>
          <span className="eyebrow">Customer Account</span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", marginTop: 4 }}>My Bookings</h1>
          <p className="text-muted">Track reservation status and booking requests submitted to venue owners.</p>
        </div>

        <Link to="/venues" className="btn btn-primary">
          Browse Venues <span>→</span>
        </Link>
      </div>

      {/* Status Filter Pill Tabs */}
      <div className="row-wrap" style={{ gap: 8 }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`btn btn-sm ${statusFilter === tab.value ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <Loader label="Loading your bookings..." />}

      {!loading && error && (
        <div className="alert alert-danger">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <span style={{ fontSize: 40, display: "block" }}>📅</span>
          <h3>No Bookings Found</h3>
          <p className="text-muted" style={{ maxWidth: 460 }}>
            You haven't requested any venue reservations matching this filter yet. Browse our venues catalog to find your ideal space.
          </p>
          <Link to="/venues" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
            Browse Available Venues <span>→</span>
          </Link>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="grid-2">
          {bookings.map((booking) => (
            <BookingCard
              key={booking?._id || booking?.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
