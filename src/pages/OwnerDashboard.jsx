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

  const pendingCount = stats?.bookings?.pending ?? 0;
  const approvedCount = stats?.bookings?.approved ?? 0;
  const rejectedCount = stats?.bookings?.rejected ?? 0;
  const cancelledCount = stats?.bookings?.cancelled ?? 0;
  const totalBookingsCount = pendingCount + approvedCount + rejectedCount + cancelledCount;

  return (
    <div className="container stack-lg" style={{ paddingTop: 40, paddingBottom: 64 }}>
      {/* Page Header */}
      <div className="row-between">
        <div>
          <span className="eyebrow">Owner Control Panel</span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", marginTop: 4 }}>Owner Dashboard</h1>
          <p className="text-muted">Manage your venue listings, review customer booking requests, and track stats.</p>
        </div>

        <button
          type="button"
          className="btn btn-accent btn-lg"
          onClick={openCreateForm}
        >
          + Add Venue <span>→</span>
        </button>
      </div>

      {loading && <Loader label="Loading owner dashboard..." />}

      {!loading && error && (
        <div className="alert alert-danger">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{error}</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Pastel Stat Cards Row */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card card-pastel-purple">
                <span className="eyebrow" style={{ color: "var(--ink)" }}>Venues Listed</span>
                <span className="stat-number">{stats.venues ?? 0}</span>
                <span className="text-xs" style={{ color: "rgba(10,10,11,0.7)" }}>Active properties</span>
              </div>

              <div className="stat-card card-pastel-peach">
                <span className="eyebrow" style={{ color: "var(--ink)" }}>Pending Requests</span>
                <span className="stat-number">{pendingCount}</span>
                <span className="text-xs" style={{ color: "rgba(10,10,11,0.7)" }}>Action required</span>
              </div>

              <div className="stat-card card-pastel-green">
                <span className="eyebrow" style={{ color: "var(--ink)" }}>Approved</span>
                <span className="stat-number">{approvedCount}</span>
                <span className="text-xs" style={{ color: "rgba(10,10,11,0.7)" }}>Confirmed dates</span>
              </div>

              <div className="stat-card card-pastel-pink">
                <span className="eyebrow" style={{ color: "var(--ink)" }}>Rejected</span>
                <span className="stat-number">{rejectedCount}</span>
                <span className="text-xs" style={{ color: "rgba(10,10,11,0.7)" }}>Declined requests</span>
              </div>

              <div className="stat-card card-pastel-mint">
                <span className="eyebrow" style={{ color: "var(--ink)" }}>Total Requests</span>
                <span className="stat-number">{totalBookingsCount}</span>
                <span className="text-xs" style={{ color: "rgba(10,10,11,0.7)" }}>All time</span>
              </div>
            </div>
          )}

          {/* Booking Requests Section */}
          <section className="card stack-lg">
            <div className="row-between" style={{ alignItems: "flex-end" }}>
              <div>
                <span className="eyebrow">Customer Requests</span>
                <h2 style={{ fontSize: 28, marginTop: 2 }}>Booking Requests</h2>
                <p className="text-muted text-sm">Review, approve, or reject date requests submitted by users.</p>
              </div>

              {/* Filters */}
              <div className="row" style={{ gap: 12 }}>
                <div className="field" style={{ width: "auto" }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>Filter Status</span>
                  <select
                    className="select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ height: 40, fontSize: 14 }}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="field" style={{ width: "auto" }}>
                  <span className="eyebrow" style={{ fontSize: 10 }}>Filter Venue</span>
                  <select
                    className="select"
                    value={venueFilter}
                    onChange={(e) => setVenueFilter(e.target.value)}
                    style={{ height: 40, fontSize: 14 }}
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
            </div>

            {bookings.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <h3>No Requests Found</h3>
                <p className="text-muted text-sm">There are no booking requests matching your selected filters.</p>
              </div>
            ) : (
              <div className="grid-2">
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

          {/* My Venues Section */}
          <section className="card stack-lg">
            <div className="row-between">
              <div>
                <span className="eyebrow">Property Portfolio</span>
                <h2 style={{ fontSize: 28, marginTop: 2 }}>My Venues</h2>
                <p className="text-muted text-sm">Properties you currently have listed on EventFlow.</p>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={openCreateForm}
              >
                + Add Venue
              </button>
            </div>

            {venues.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <h3>No Venues Listed Yet</h3>
                <p className="text-muted text-sm">Click "+ Add Venue" to list your first space for bookings.</p>
                <button type="button" className="btn btn-primary" onClick={openCreateForm}>
                  Add Your First Venue
                </button>
              </div>
            ) : (
              <div className="grid-3">
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

          {/* Venue Form Modal */}
          {showForm && (
            <VenueForm
              syncKey={formSyncKey}
              isEditMode={editMode}
              initialValues={editMode && selectedVenue ? selectedVenue : {}}
              onSubmit={handleVenueSubmit}
              onCancel={closeForm}
              isSubmitting={savingVenue}
            />
          )}
        </>
      )}
    </div>
  );
}

export default OwnerDashboard;
