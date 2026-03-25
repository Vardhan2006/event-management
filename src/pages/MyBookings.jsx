import { useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import BookingCard from "../components/bookings/BookingCard";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";

function MyBookings() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);

  const userId = user?.id || user?.clerkId || user?.email;

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError("");
        if (!isAuthenticated) return;
        const data = await eventService.getUserBookings(userId);
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setError("We couldn’t load your bookings right now.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [isAuthenticated, userId]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My bookings</h1>
          <p className="page-subtitle">
            Requests you&apos;ve submitted to venue owners.
          </p>
        </div>
      </div>

      {loading && <Loader label="Loading bookings..." />}

      {!loading && error && (
        <div className="card">
          <div className="card-title">Something went wrong</div>
          <div className="card-subtitle">{error}</div>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3 className="empty-state-title">No bookings yet</h3>
          <p className="empty-state-subtitle">
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
              showVenueDetails={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;

