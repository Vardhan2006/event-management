import { useCallback, useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import BookingCard from "../components/bookings/BookingCard";
import VenueCard from "../components/venues/VenueCard";
import VenueForm from "../components/venues/VenueForm";
import venueService from "../services/venueService";
import bookingService from "../services/bookingService";

function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [formSession, setFormSession] = useState(0);
  const [savingVenue, setSavingVenue] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const statsData = await bookingService.getOwnerStats();
      setStats(statsData);

      const ownerVenues = await venueService.getOwnerVenues();
      setVenues(Array.isArray(ownerVenues) ? ownerVenues : []);

      const queryParams = {};
      if (statusFilter) queryParams.status = statusFilter;
      if (venueFilter) queryParams.venueId = venueFilter;

      const ownerBookings = await bookingService.getOwnerBookings(queryParams);
      setBookings(Array.isArray(ownerBookings) ? ownerBookings : []);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || "We couldn't load your dashboard data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, venueFilter]);

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
    if (!(formData instanceof FormData)) {
      setError("Invalid form data.");
      return;
    }

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
      const msg = err.response?.data?.error?.message || err.message || "Couldn't save venue.";
      setError(msg);
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
    if (!id) return;

    setError("");
    try {
      await venueService.deleteVenue(id);
      if (selectedVenue && String(selectedVenue._id || selectedVenue.id) === String(id)) {
        closeForm();
      }
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || "We couldn't delete this venue.";
      setError(msg);
    }
  };

  const handleReviewBooking = async (bookingId, status) => {
    setError("");
    try {
      await bookingService.reviewBookingStatus(bookingId, status);
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || "We couldn't update this booking request.";
      setError(msg);
    }
  };

  const formSyncKey = `${formSession}-${editMode}-${selectedVenue?._id || selectedVenue?.id || "new"}`;

  return (
    <div className="page owner-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Owner dashboard</h1>
          <p className="page-subtitle">
            Review booking requests, manage venues, and track stats.
          </p>
        </div>
      </div>

      {loading && <Loader label="Loading owner dashboard..." />}

      {!loading && error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: "bold" }}>Dashboard Alert</div>
          <div>{error}</div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-3" style={{ marginBottom: 24, gap: 16 }}>
              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#6C63FF" }}>
                  {stats.venues ?? 0}
                </div>
                <div className="text-sm text-muted">Total Venues Listed</div>
              </div>

              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e65100" }}>
                  {stats.bookings?.pending ?? 0}
                </div>
                <div className="text-sm text-muted">Pending Requests</div>
              </div>

              <div className="card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#2e7d32" }}>
                  {stats.bookings?.approved ?? 0}
                </div>
                <div className="text-sm text-muted">Approved Bookings</div>
              </div>
            </div>
          )}

          {/* Bookings Section */}
          <section className="card owner-dashboard-section" style={{ marginBottom: 24 }}>
            <div className="card-header owner-dashboard-section-header" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 className="card-title">Booking requests</h2>
                <p className="card-subtitle">
                  Approve or reject venue booking requests.
                </p>
              </div>

              {/* Booking Filters */}
              <div style={{ display: "flex", gap: 10 }}>
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

                <select
                  className="form-select"
                  value={venueFilter}
                  onChange={(e) => setVenueFilter(e.target.value)}
                  style={{ width: "auto" }}
                >
                  <option value="">All Venues</option>
                  {venues.map((v) => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {bookings.length === 0 ? (
              <p className="text-muted text-sm" style={{ padding: 16 }}>
                No booking requests found.
              </p>
            ) : (
              <div className="booking-list" style={{ marginTop: 12 }}>
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

          {/* Venues Section */}
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
              <p className="text-muted text-sm" style={{ padding: 16 }}>
                No venues yet. Use &quot;+ Add new venue&quot; to create one.
              </p>
            ) : (
              <div className="grid venues-grid grid-3" style={{ marginTop: 16 }}>
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

          {/* Form Modal / Section */}
          {showForm && (
            <section className="owner-dashboard-form-section" style={{ marginTop: 24 }}>
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
