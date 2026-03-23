import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [bookings, setBookings] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [formSession, setFormSession] = useState(0);

  const [savingVenue, setSavingVenue] = useState(false);

  const fetchData = useCallback(async () => {
    if (!ownerId) {
      setVenues([]);
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const allVenues = await venueService.getVenues();
      const filtered = Array.isArray(allVenues)
        ? allVenues.filter((v) => String(v.ownerId) === String(ownerId))
        : [];
      setVenues(filtered);

      const ownerBookings = await eventService.getOwnerBookings(ownerId);
      setBookings(Array.isArray(ownerBookings) ? ownerBookings : []);
    } catch (err) {
      console.error(err);
      setError("We couldn’t load your dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const closeForm = () => {
    setShowForm(false);
    setEditMode(false);
    setSelectedVenue(null);
  };

  const openCreateForm = () => {
    setSelectedVenue(null);
    setEditMode(false);
    setFormSession((n) => n + 1);
    setShowForm(true);
  };

  const openEditForm = (venue) => {
    setSelectedVenue(venue);
    setEditMode(true);
    setFormSession((n) => n + 1);
    setShowForm(true);
  };

  const handleVenueSubmit = async (formData) => {
    if (!ownerId) {
      setError("Owner identity is missing. Please sign in again.");
      return;
    }
    if (!(formData instanceof FormData)) {
      setError("Invalid form data.");
      return;
    }
    formData.append("ownerId", ownerId);

    setSavingVenue(true);
    setError("");
    try {
      if (editMode && selectedVenue) {
        const id = selectedVenue._id || selectedVenue.id;
        await venueService.updateVenue(id, formData);
      } else {
        await venueService.createVenue(formData);
      }
      closeForm();
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(
        editMode
          ? "We couldn’t update this venue. Please try again."
          : "We couldn’t create this venue. Please try again."
      );
    } finally {
      setSavingVenue(false);
    }
  };

  const handleDeleteVenue = async (venue) => {
    const name = venue?.name || "this venue";
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      return;
    }
    const id = venue?._id || venue?.id;
    if (!id || !ownerId) return;

    setError("");
    try {
      await venueService.deleteVenue(id, ownerId);
      setVenues((prev) =>
        prev.filter((v) => String(v._id || v.id) !== String(id))
      );
      if (selectedVenue && String(selectedVenue._id || selectedVenue.id) === String(id)) {
        closeForm();
      }
    } catch (err) {
      console.error(err);
      setError("We couldn’t delete this venue. Please try again.");
    }
  };

  const handleReviewBooking = async (bookingId, status) => {
    try {
      await eventService.reviewBooking(bookingId, { status, ownerId });
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("We couldn’t update this booking request. Please try again.");
    }
  };

  const formSyncKey = `${formSession}-${editMode}-${selectedVenue?._id || selectedVenue?.id || "new"}`;

  return (
    <div className="page owner-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Owner dashboard</h1>
          <p className="page-subtitle">
            Review booking requests, manage venues, and add new listings.
          </p>
        </div>
      </div>

      {loading && <Loader label="Loading owner dashboard..." />}

      {!loading && error && (
        <div className="card owner-dashboard-alert">
          <div className="card-title">Something went wrong</div>
          <div className="card-subtitle">{error}</div>
        </div>
      )}

      {!loading && (
        <>
          <section className="card owner-dashboard-section">
            <div className="card-header">
              <h2 className="card-title">Booking requests</h2>
              <p className="card-subtitle">
                Approve or reject venue booking requests.
              </p>
            </div>
            {bookings.length === 0 ? (
              <p className="text-muted text-sm">No booking requests at the moment.</p>
            ) : (
              <div className="booking-list">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking?._id || booking?.id}
                    booking={booking}
                    isOwnerView
                    onApprove={(bid) => handleReviewBooking(bid, "approved")}
                    onReject={(bid) => handleReviewBooking(bid, "rejected")}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="card owner-dashboard-section">
            <div className="card-header owner-dashboard-section-header">
              <div>
                <h2 className="card-title">My venues</h2>
                <p className="card-subtitle">
                  Venues you have listed. Edit, delete, or view public details.
                </p>
              </div>
              {!showForm && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openCreateForm}
                >
                  + Add new venue
                </button>
              )}
            </div>

            {venues.length === 0 ? (
              <p className="text-muted text-sm">
                No venues yet. Use &quot;+ Add new venue&quot; to create one.
              </p>
            ) : (
              <div className="grid venues-grid grid-3">
                {venues.map((venue) => (
                  <VenueCard
                    key={venue?._id || venue?.id}
                    venue={venue}
                    ownerMode
                    onEdit={openEditForm}
                    onDelete={handleDeleteVenue}
                  />
                ))}
              </div>
            )}
          </section>

          {showForm && (
            <section className="owner-dashboard-form-section">
              <VenueForm
                syncKey={formSyncKey}
                isEditMode={editMode}
                initialValues={editMode && selectedVenue ? selectedVenue : {}}
                onSubmit={handleVenueSubmit}
                onCancel={closeForm}
                isSubmitting={savingVenue}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default OwnerDashboard;
