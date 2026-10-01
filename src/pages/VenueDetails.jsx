import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Loader from "../components/common/Loader";
import venueService from "../services/venueService";
import bookingService from "../services/bookingService";
import { useAuth } from "../context/AuthContext";

function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isUser, user } = useAuth();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [month, setMonth] = useState(() => {
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  });
  const [bookedDates, setBookedDates] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [showRequest, setShowRequest] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  const [form, setForm] = useState({
    title: "",
    notes: "",
    eventDate: "",
  });

  useEffect(() => {
    async function loadVenue() {
      try {
        setLoading(true);
        setError("");
        const data = await venueService.getVenueById(id);
        setVenue(data);
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message || "We couldn't find this venue.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadVenue();
  }, [id]);

  useEffect(() => {
    async function loadAvailability() {
      if (!id || !month) return;
      try {
        setAvailabilityLoading(true);
        const res = await venueService.getVenueAvailability(id, month);
        setBookedDates(Array.isArray(res.bookedDates) ? res.bookedDates : []);
      } catch {
        setBookedDates([]);
      } finally {
        setAvailabilityLoading(false);
      }
    }

    loadAvailability();
  }, [id, month]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setRequestSubmitting(true);
    setRequestError("");

    try {
      const payload = {
        venueId: id,
        title: form.title.trim(),
        notes: form.notes.trim(),
        eventDate: form.eventDate,
      };

      await bookingService.createBooking(payload);
      setShowRequest(false);
      navigate("/my-bookings");
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || "We couldn't submit your request.";
      setRequestError(msg);
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading venue details..." />;

  if (error || !venue)
    return (
      <div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div className="empty-state">
          <h3>Venue Not Found</h3>
          <p className="text-muted">{error || "The venue you are looking for may have been removed."}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/venues")}
          >
            Back to Venues
          </button>
        </div>
      </div>
    );

  const formattedCapacity =
    venue?.capacity !== undefined && venue?.capacity !== null
      ? Number(venue.capacity).toLocaleString()
      : "";

  const isDateBooked = form.eventDate && bookedDates.includes(form.eventDate);
  const isOwnerOfVenue = user?.role === "owner" && (user?.id === venue?.ownerId || user?.id === venue?.owner?._id);

  return (
    <div className="container stack-lg" style={{ paddingTop: 40, paddingBottom: 64 }}>
      {/* Header */}
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <div>
          <span className="eyebrow">Venue Details</span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", marginTop: 4 }}>{venue.name}</h1>
          <div className="row" style={{ gap: 8, marginTop: 8, color: "var(--muted)" }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{venue.location}</span>
            {venue?.owner?.name && <span>· Managed by <strong>{venue.owner.name}</strong></span>}
          </div>
        </div>

        {venue?.pricePerDay !== undefined && venue?.pricePerDay !== null && (
          <div className="badge" style={{ fontSize: 18, padding: "8px 20px", backgroundColor: "var(--card-green-bg)", border: "2px solid var(--ink)" }}>
            ${Number(venue.pricePerDay).toLocaleString()} / day
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="venue-details-grid">
        {/* Left Column: Gallery & Details */}
        <div className="stack-lg">
          {/* Gallery */}
          <div>
            {venue?.images?.length > 0 ? (
              <div>
                <img
                  src={venue.images[selectedImageIndex] || venue.images[0]}
                  alt={venue.name}
                  className="gallery-main-img"
                />
                {venue.images.length > 1 && (
                  <div className="gallery-thumbs">
                    {venue.images.map((imgUrl, idx) => (
                      <img
                        key={imgUrl}
                        src={imgUrl}
                        alt={`${venue.name} ${idx + 1}`}
                        className={`gallery-thumb ${idx === selectedImageIndex ? "active" : ""}`}
                        onClick={() => setSelectedImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="venue-card-img-placeholder" style={{ height: 380, borderRadius: "var(--radius-card)", border: "1px solid var(--line-soft)" }}>
                <span>No Photos Available</span>
              </div>
            )}
          </div>

          {/* Specs Bar */}
          <div className="card grid-3" style={{ padding: 24, textAlign: "center" }}>
            <div>
              <span className="eyebrow">Capacity</span>
              <strong style={{ fontSize: 20, display: "block", marginTop: 4 }}>{formattedCapacity ? `${formattedCapacity} Guests` : "N/A"}</strong>
            </div>
            <div>
              <span className="eyebrow">Rate</span>
              <strong style={{ fontSize: 20, display: "block", marginTop: 4 }}>
                {venue?.pricePerDay ? `$${Number(venue.pricePerDay).toLocaleString()}/day` : "Contact for rate"}
              </strong>
            </div>
            <div>
              <span className="eyebrow">Status</span>
              <span className="badge badge-approved" style={{ marginTop: 4 }}>Active Space</span>
            </div>
          </div>

          {/* Description */}
          <div className="card stack">
            <span className="eyebrow">About Space</span>
            <h3 style={{ fontSize: 24 }}>Description</h3>
            <p style={{ color: "var(--ink)", lineHeight: 1.7, fontSize: 16 }}>
              {venue.description || "No description provided for this venue space."}
            </p>
          </div>

          {/* Services */}
          {venue?.services?.length > 0 && (
            <div className="card stack">
              <span className="eyebrow">Amenities & Services</span>
              <div className="chips-row" style={{ gap: 8 }}>
                {venue.services.map((s) => (
                  <span key={s} className="chip" style={{ fontSize: 14, padding: "8px 16px" }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Booking Card & Availability */}
        <div>
          <div className="booking-sticky-card">
            <div className="stack-sm">
              <span className="eyebrow">Reservation</span>
              <h3 style={{ fontSize: 24 }}>Book This Venue</h3>
              <p className="text-muted text-sm">Select dates and send your request directly to the owner.</p>
            </div>

            {/* Availability Month Selector */}
            <div className="field">
              <label htmlFor="availability-month">Availability Month</label>
              <input
                id="availability-month"
                type="month"
                className="input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>

            {availabilityLoading && <Loader label="Checking dates..." />}

            {!availabilityLoading && (
              <div className="stack-sm">
                <span className="eyebrow">Reserved Dates in {month}</span>
                {bookedDates.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--success)", fontWeight: 600 }}>
                    ✓ All dates in {month} are currently available!
                  </p>
                ) : (
                  <div className="date-chips-grid">
                    {bookedDates.map((d) => (
                      <span key={d} className="badge badge-rejected" style={{ fontSize: 11 }}>
                        Booked {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User Booking Request Form */}
            {isUser && !isOwnerOfVenue && (
              <>
                <div style={{ height: 1, backgroundColor: "var(--line-soft)" }} />

                {!showRequest ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-full btn-lg"
                    onClick={() => setShowRequest(true)}
                  >
                    Request Booking Now
                  </button>
                ) : (
                  <form className="stack" onSubmit={handleRequestBooking}>
                    {requestError && (
                      <div className="alert alert-danger">
                        <span>{requestError}</span>
                      </div>
                    )}

                    {isDateBooked && (
                      <div className="alert alert-danger">
                        <span>⚠️ Selected date ({form.eventDate}) is already booked! Please choose another date.</span>
                      </div>
                    )}

                    <div className="field">
                      <label htmlFor="title">Event Title</label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        className="input"
                        placeholder="e.g. Corporate Gala"
                        value={form.title}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="eventDate">Event Date</label>
                      <input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        className="input"
                        value={form.eventDate}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="notes">Special Requests / Notes</label>
                      <textarea
                        id="notes"
                        name="notes"
                        className="textarea"
                        placeholder="Catering, seating layout, audio setup..."
                        value={form.notes}
                        onChange={onChange}
                      />
                    </div>

                    <div className="row" style={{ gap: 8 }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={requestSubmitting || isDateBooked}
                      >
                        {requestSubmitting ? "Submitting..." : "Submit Request"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowRequest(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Logged-out User Prompt */}
            {!isAuthenticated && (
              <div className="stack-sm" style={{ padding: 16, background: "var(--bg)", borderRadius: "var(--radius-card)", textAlign: "center" }}>
                <p className="text-sm font-semibold">Sign in to book this venue</p>
                <Link to="/login" className="btn btn-primary btn-full btn-sm">
                  Log In to Book
                </Link>
              </div>
            )}

            {/* Owner View Info Card */}
            {user?.role === "owner" && (
              <div className="stack-sm" style={{ padding: 16, background: "var(--card-purple-bg)", borderRadius: "var(--radius-card)", border: "1px solid var(--ink)" }}>
                <span className="eyebrow" style={{ color: "var(--ink)" }}>Owner Mode</span>
                <p className="text-sm" style={{ color: "var(--ink)" }}>
                  {isOwnerOfVenue
                    ? "This is your venue listing. Manage bookings and details from your Owner Dashboard."
                    : "You are signed in as an Owner. Switch to a Customer account to submit booking requests."}
                </p>
                <Link to="/owner-dashboard" className="btn btn-secondary btn-full btn-sm" style={{ marginTop: 8 }}>
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VenueDetails;
