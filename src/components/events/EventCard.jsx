import { Link } from "react-router-dom";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventCard({ event }) {
  return (
    <article className="event-card">
      <div className="event-card-header">
        <div>
          <h3 className="event-card-title">{event.title}</h3>
          <div className="event-card-meta">
            <span>{formatDate(event.date)}</span>
            {" · "}
            <span>{event.isOnline ? "Online" : event.location}</span>
          </div>
        </div>
        {event.category && (
          <span className="event-card-category">{event.category}</span>
        )}
      </div>

      <p className="event-card-description">
        {event.shortDescription || event.description}
      </p>

      <div className="event-card-footer">
        <span className="event-card-location">
          {event.attendees
            ? `${event.attendees.toLocaleString()} attending`
            : "New event"}
        </span>
        <Link to={`/events/${event.id}`} className="btn btn-secondary">
          View details
        </Link>
      </div>
    </article>
  );
}

export default EventCard;