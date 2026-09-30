import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/common/Loader";
import venueService from "../services/venueService";
import bookingService from "../services/bookingService";
import { useAuth } from "../context/AuthContext";

function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isUser } = useAuth();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        eventDate: form.eventDate, // YYYY-MM-DD
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
      <div className="page">
        <div className="card">
          <div className="card-title">Venue not found</div>
          <div className="card-subtitle">{error || "The venue you are looking for may have been removed."}</div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/venues")}
            style={{ marginTop: 12 }}
          >
            Back to venues
          </button>
        </div>
      </div>
    );

  const formattedCapacity =
    venue?.capacity !== undefined && venue?.capacity !== null
      ? Number(venue.capacity).toLocaleString()
      : "";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{venue.name}</h1>
          <p className="page-subtitle">
            {venue.location}
            {venue?.pricePerDay !== undefined && venue?.pricePerDay !== null && (
              <> · ${Number(venue.pricePerDay).toLocaleString()} / day</>
            )}
            {venue?.owner?.name && <> · Managed by {venue.owner.name}</>}
          </p>
        </div>
        {isUser && (
          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowRequest((prev) => !prev)}
            >
              {showRequest ? "Hide booking form" : "Request booking"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-2 venue-details-layout">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">About this venue</h2>
            <p className="card-subtitle">Full details and availability.</p>
          </div>

          <div className="venue-detail-row">
            <div className="venue-detail-label">Capacity</div>
            <div className="venue-detail-value">
              {formattedCapacity ? `${formattedCapacity} guests` : "-"}
            </div>
          </div>

          <div className="venue-detail-row">
            <div className="venue-detail-label">Owner</div>
            <div className="venue-detail-value">{venue?.owner?.name || "Venue Owner"}</div>
          </div>

          {venue?.services?.length > 0 && (
            <div className="venue-detail-row">
              <div className="venue-detail-label">Services</div>
              <div className="venue-detail-value">
                {venue.services.join(", ")}
              </div>
            </div>
          )}

          <div className="venue-detail-row">
            <div className="venue-detail-label">Description</div>
            <div className="venue-detail-value venue-description">
              {venue.description}
            </div>
          </div>

          {/* Availability Calendar / List Section */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Check Availability</h3>
            <div className="form-group" style={{ maxWidth: 200, marginBottom: 16 }}>
              <label className="form-label" htmlFor="availability-month">Select Month</label>
              <input
                id="availability-month"
                type="month"
                className="form-input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>

            {availabilityLoading && <p className="text-sm text-muted">Checking availability...</p>}

            {!availabilityLoading && (
              <div>
                {bookedDates.length === 0 ? (
                  <p className="text-sm text-success" style={{ color: "#2e7d32" }}>
                    All dates in {month} are currently available for booking!
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
                      Already booked dates in {month}:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {bookedDates.map((dateStr) => (
                        <span
                          key={dateStr}
                          style={{
                            background: "#ffebee",
                            color: "#c62828",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: "0.85rem",
                          }}
                        >
                          {dateStr}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <aside>
          {showRequest && (
            <div className="card venue-request-card">
              <div className="card-header">
                <h2 className="card-title">Request booking</h2>
                <p className="card-subtitle">
                  Send a booking request to {venue?.owner?.name || "the venue owner"}.
                </p>
              </div>

              {!isAuthenticated && (
                <div className="card" style={{ padding: 16, marginBottom: 14 }}>
                  <div className="card-title">Sign in required</div>
                  <div className="card-subtitle">
                    Please log in as a user to request a booking.
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/login")}
                    style={{ marginTop: 10 }}
                  >
                    Go to login
                  </button>
                </div>
              )}

              {isAuthenticated && (
                <>
                  {requestError && (
                    <div className="alert alert-error" style={{ marginBottom: 14 }}>
                      {requestError}
                    </div>
                  )}

                  <form onSubmit={handleRequestBooking}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="title">
                        Event title
                      </label>
                      <input
                        id="title"
                        name="title"
                        className="form-input"
                        placeholder="e.g. Annual Team Gala"
                        value={form.title}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="eventDate">
                        Event date
                      </label>
                      <input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        className="form-input"
                        value={form.eventDate}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="notes">
                        Notes / Requests (Optional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        className="form-textarea"
                        placeholder="Catering or equipment requests..."
                        value={form.notes}
                        onChange={onChange}
                      />
                    </div>

                    <div className="venue-request-actions">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={requestSubmitting}
                      >
                        {requestSubmitting ? "Submitting..." : "Submit request"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setShowRequest(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {!showRequest && (
            <div className="card">
              <div className="card-title">Ready to book?</div>
              <div className="card-subtitle">
                Click &quot;Request booking&quot; to check dates and submit your booking.
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default VenueDetails;
