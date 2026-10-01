import { Link } from "react-router-dom";

function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "";
  return `$${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function VenueCard({ venue, ownerMode, onEdit, onDelete }) {
  const id = venue?._id || venue?.id;

  return (
    <article className="venue-card">
      <Link to={`/venues/${id}`} className="venue-card-img-wrapper" tabIndex="-1">
        {venue?.images?.length > 0 && venue.images[0] ? (
          <img
            src={venue.images[0]}
            alt={venue?.name || "Venue"}
            className="venue-card-img"
            loading="lazy"
          />
        ) : (
          <div className="venue-card-img-placeholder">
            <span>No photo</span>
          </div>
        )}
      </Link>

      <div className="venue-card-body">
        <div className="row-between" style={{ alignItems: "flex-start", gap: 8 }}>
          <Link to={`/venues/${id}`}>
            <h3 className="venue-card-title">{venue?.name}</h3>
          </Link>
          {venue?.pricePerDay !== undefined && venue?.pricePerDay !== null && (
            <span className="badge" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--ink)", fontSize: 13, padding: "4px 10px" }}>
              {formatPrice(venue.pricePerDay)}/day
            </span>
          )}
        </div>

        <div className="venue-card-meta">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{venue?.location}</span>
          {venue?.capacity !== undefined && venue?.capacity !== null && (
            <span>· {Number(venue.capacity).toLocaleString()} guests</span>
          )}
        </div>

        {venue?.services?.length > 0 && (
          <div className="chips-row">
            {venue.services.slice(0, 3).map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px 20px 20px", display: "flex", gap: 8 }}>
        {ownerMode && onEdit && onDelete ? (
          <div className="row" style={{ width: "100%", gap: 8 }}>
            <Link to={`/venues/${id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
              View
            </Link>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(venue)}
              aria-label="Edit venue"
              style={{ flex: 1 }}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(venue)}
              aria-label="Delete venue"
            >
              Delete
            </button>
          </div>
        ) : (
          <Link to={`/venues/${id}`} className="btn btn-secondary btn-full btn-sm">
            View Details <span>→</span>
          </Link>
        )}
      </div>
    </article>
  );
}

export default VenueCard;
