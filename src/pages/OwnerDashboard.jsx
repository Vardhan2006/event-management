import { useEffect, useMemo, useState } from "react";
import Loader from "../components/common/Loader";
import BookingCard from "../components/bookings/BookingCard";
import VenueCard from "../components/venues/VenueCard";
import VenueForm from "../components/venues/VenueForm";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import venueService from "../services/venueService";

function OwnerDashboard() {
  const { user } = useAuth();

  const ownerId = useMemo(
    () => user?.id || user?.clerkId || user?.email,
    [user]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [venues, setVenues] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);

  const [creatingVenue, setCreatingVenue] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const allVenues = await venueService.getVenues();
      const filtered = Array.isArray(allVenues)
        ? allVenues.filter((v) => String(v.ownerId) === String(ownerId))
        : [];
      setVenues(filtered);

      const ownerBookings = await eventService.getOwnerBookings(ownerId);
      setBookingRequests(Array.isArray(ownerBookings) ? ownerBookings : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("We couldn’t load your dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateVenue = async (payload) => {
    if (!ownerId) {
      setError("Owner identity is missing. Please sign in again.");
      return;
    }
    setCreatingVenue(true);
    setError("");
    try {
      await venueService.createVenue({ ...payload, ownerId });
      await refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("We couldn’t create your venue. Please try again.");
    } finally {
      setCreatingVenue(false);
    }
  };

  const handleReviewBooking = async (bookingId, status) => {
    try {
      await eventService.reviewBooking(bookingId, { status, ownerId });
      await refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("We couldn’t update this booking request. Please try again.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Owner dashboard</h1>
          <p className="page-subtitle">
            Manage your venues and approve booking requests.
          </p>
        </div>
      </div>

      {loading && <Loader label="Loading owner dashboard..." />}

      {!loading && error && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Something went wrong</div>
          <div className="card-subtitle">{error}</div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-2">
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Your venues</h2>
              <p className="card-subtitle">
                Create new venues and view what you’ve listed.
              </p>
            </div>

            <VenueForm
              onSubmit={handleCreateVenue}
              isSubmitting={creatingVenue}
            />

            <div style={{ height: 18 }} />

            {venues.length === 0 ? (
              <p className="text-muted text-sm">
                No venues yet. Create your first venue above.
              </p>
            ) : (
              <div className="grid venues-grid">
                {venues.map((venue) => (
                  <VenueCard
                    key={venue?._id || venue?.id}
                    venue={venue}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Booking requests</h2>
              <p className="card-subtitle">
                Review requests and approve or reject.
              </p>
            </div>

            {bookingRequests.length === 0 ? (
              <p className="text-muted text-sm">
                No booking requests at the moment.
              </p>
            ) : (
              <div className="booking-list">
                {bookingRequests.map((booking) => (
                  <BookingCard
                    key={booking?._id || booking?.id}
                    booking={booking}
                    isOwnerView
                    onApprove={(id) => handleReviewBooking(id, "approved")}
                    onReject={(id) => handleReviewBooking(id, "rejected")}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;

