import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/common/Loader";
import eventService from "../services/eventService";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (err) {
        setError("We couldn&apos;t find this event.");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  const handleRegister = () => {
    // Placeholder for future registration logic
    // eslint-disable-next-line no-alert
    alert("You are registered for this event (placeholder).");
  };

  if (loading) {
    return <Loader label="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="page">
        <div className="card">
          <div className="card-title">Event not found</div>
          <div className="card-subtitle">
            The event you are looking for may have been removed or is not yet
            published.
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/events")}
          >
            Back to events
          </button>
        </div>
      </div>
    );
  }

  const isOnline =
    event.isOnline || event.location?.toLowerCase() === "online";

  const formattedDate = new Date(event.date).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{event.title}</h1>
          <p className="page-subtitle">
            {isOnline ? "Online event" : event.location}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/events")}
        >
          Back to events
        </button>
      </div>

      <div className="event-details-layout">
        <section className="event-details-main card">
          <p className="text-muted">{formattedDate}</p>

          <div className="event-details-meta">
            <span>
              {isOnline ? "Online · Join from anywhere" : event.location}
            </span>
            {event.category && <span>· {event.category}</span>}
            {event.attendees && (
              <span>· {event.attendees.toLocaleString()} attending</span>
            )}
          </div>

          <p>{event.description}</p>

          {event.organizer && (
            <p className="event-details-organizer">
              Hosted by <strong>{event.organizer}</strong>
            </p>
          )}
        </section>

        <aside className="event-details-sidebar">
          <div className="card">
            <div className="card-title">Register for this event</div>
            <div className="card-subtitle">
              Secure your spot in just a click. No payment is processed on this
              demo UI.
            </div>
            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>

          <div className="card">
            <div className="card-title">Event details</div>
            <div className="card-subtitle">
              Date: <strong>{formattedDate}</strong>
            </div>
            <div className="card-subtitle">
              Format: <strong>{isOnline ? "Online" : "In-person"}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default EventDetails;

