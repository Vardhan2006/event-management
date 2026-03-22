import { useEffect } from "react";
import { Link } from "react-router-dom";

function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "";
  return `$${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function VenueCard({ venue }) {
  const id = venue?._id || venue?.id;

  useEffect(() => {
    if (venue?.images?.length) {
      // eslint-disable-next-line no-console
      console.log("[VenueCard] venue:", venue?.name, "first image:", venue.images[0]);
    }
  }, [venue]);

  return (
    <article className="venue-card">

      {/* First Cloudinary / stored URL */}
      {venue?.images?.length > 0 && venue.images[0] ? (
        <img
          src={venue.images[0]}
          alt={venue?.name || "Venue"}
          className="venue-card-image"
          loading="lazy"
        />
      ) : (
        <div className="venue-card-image venue-card-image-placeholder" aria-hidden>
          No photo
        </div>
      )}

      <div className="venue-card-top">
        <h3 className="venue-card-title">{venue?.name}</h3>
        {venue?.pricePerDay !== undefined && venue?.pricePerDay !== null && (
          <span className="venue-card-price">
            {formatPrice(venue.pricePerDay)}
          </span>
        )}
      </div>

      <div className="venue-card-meta">
        <span>{venue?.location}</span>
        {venue?.capacity !== undefined && venue?.capacity !== null && (
          <span>
            · Up to {Number(venue.capacity).toLocaleString()} guests
          </span>
        )}
      </div>

      {venue?.services?.length > 0 && (
        <div className="venue-card-services">
          {venue.services.slice(0, 3).map((s) => (
            <span key={s} className="pill">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="venue-card-footer">
        <Link to={`/venues/${id}`} className="btn btn-secondary">
          View details
        </Link>
      </div>

    </article>
  );
}

export default VenueCard;