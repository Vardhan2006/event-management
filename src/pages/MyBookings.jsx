import { useEffect, useState, useCallback } from "react";
import Loader from "../components/common/Loader";
import BookingCard from "../components/bookings/BookingCard";
import { useAuth } from "../context/AuthContext";
import bookingService from "../services/bookingService";

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
    <div className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">My bookings</h1>
          <p className="page-subtitle">
            Booking requests you&apos;ve submitted to venue owners.
          </p>
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading && <Loader label="Loading bookings..." />}

      {!loading && error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state card" style={{ padding: 32, textAlign: "center" }}>
          <div className="empty-state-icon" style={{ fontSize: "2rem" }}>📅</div>
          <h3 className="empty-state-title" style={{ marginTop: 8 }}>No bookings found</h3>
          <p className="empty-state-subtitle text-muted">
            Visit a venue and request a booking to get started.
          </p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="booking-list">
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
