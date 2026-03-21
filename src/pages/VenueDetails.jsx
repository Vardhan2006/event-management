import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/common/Loader";
import eventService from "../services/eventService";
import venueService from "../services/venueService";
import { useAuth } from "../context/AuthContext";

function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRequest, setShowRequest] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  const userId = useMemo(() => user?.id || user?.clerkId || user?.email, [user]);

  useEffect(() => {
    async function loadVenue() {
      try {
        setLoading(true);
        setError("");
        const data = await venueService.getVenueById(id);
        setVenue(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setError("We couldn’t find this venue.");
      } finally {
        setLoading(false);
      }
    }

    loadVenue();
  }, [id]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
  });

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

    if (!userId) {
      setRequestError("User identity is missing. Please sign in again.");
      return;
    }

    setRequestSubmitting(true);
    setRequestError("");

    try {
      const payload = {
        venueId: venue?._id || venue?.id || id,
        title: form.title.trim(),
        description: form.description.trim(),
        eventDate: new Date(form.eventDate).toISOString(),
        userId,
        status: "pending",
      };

      await eventService.requestBooking(payload);
      setShowRequest(false);
      navigate("/my-bookings");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setRequestError("We couldn’t submit your request. Please try again.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading venue..." />;

  if (error || !venue)
    return (
      <div className="page">
        <div className="card">
          <div className="card-title">Venue not found</div>
          <div className="card-subtitle">
            The venue you&apos;re looking for may have been removed.
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/venues")}
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
            {venue?.pricePerDay !== undefined &&
              venue?.pricePerDay !== null && (
                <> · ${Number(venue.pricePerDay).toLocaleString()} / day</>
              )}
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowRequest(true)}
          >
            Request booking
          </button>
        </div>
      </div>

      <div className="grid grid-2 venue-details-layout">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">About this venue</h2>
            <p className="card-subtitle">Full details and capacity.</p>
          </div>

          <div className="venue-detail-row">
            <div className="venue-detail-label">Capacity</div>
            <div className="venue-detail-value">
              {formattedCapacity ? `${formattedCapacity} guests` : "-"}
            </div>
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
        </section>

        <aside>
          {showRequest && (
            <div className="card venue-request-card">
              <div className="card-header">
                <h2 className="card-title">Request booking</h2>
                <p className="card-subtitle">
                  Send a booking request for this venue.
                </p>
              </div>

              {!isAuthenticated && (
                <div className="card" style={{ padding: 16, marginBottom: 14 }}>
                  <div className="card-title">Sign in required</div>
                  <div className="card-subtitle">
                    Please log in to request a booking.
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
                    <div className="card" style={{ padding: 16, marginBottom: 14 }}>
                      <div className="card-title">Couldn’t submit request</div>
                      <div className="card-subtitle">{requestError}</div>
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
                        value={form.title}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-textarea"
                        value={form.description}
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
                        type="datetime-local"
                        className="form-input"
                        value={form.eventDate}
                        onChange={onChange}
                        required
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
                Click “Request booking” to send details to the venue owner.
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default VenueDetails;

