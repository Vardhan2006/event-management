import { useState, useEffect } from "react";
import venueService from "../../services/venueService";

function formatDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status) {
  if (!status) return "pending";
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return status;
}

function getStatusBadgeClass(status) {
  if (!status) return "status-badge status-badge-pending";
  if (status === "pending") return "status-badge status-badge-pending";
  if (status === "approved") return "status-badge status-badge-approved";
  if (status === "rejected") return "status-badge status-badge-rejected";
  return "status-badge status-badge-pending";
}

function BookingCard({ booking, onApprove, onReject, isOwnerView = false }) {
  const id = booking?._id || booking?.id;
  const status = booking?.status || "pending";
  const [venue, setVenue] = useState(null);
  const [venueLoading, setVenueLoading] = useState(false);

  useEffect(() => {
    const venueSource = booking?.venueId;
    if (venueSource) {
      if (typeof venueSource === "string") {
        setVenueLoading(true);
        venueService.getVenueById(venueSource)
          .then((venueData) => {
            setVenue(venueData);
            setVenueLoading(false);
          })
          .catch((error) => {
            console.error("Failed to fetch venue details:", error);
            setVenue(null);
            setVenueLoading(false);
          });
      } else if (typeof venueSource === "object" && venueSource !== null) {
        setVenue(venueSource);
        setVenueLoading(false);
      } else {
        setVenue(null);
        setVenueLoading(false);
      }
    } else {
      setVenue(null);
      setVenueLoading(false);
    }
  }, [booking?.venueId]);

  return (
    <article className="booking-card">
      <div className="booking-card-header">
        <div className="booking-card-title-section">
          <h3 className="booking-card-title">{booking?.title}</h3>
          <div className="booking-card-meta">
            <span>{formatDate(booking?.eventDate)}</span>
          </div>
        </div>
        <div className="booking-card-status">
          <span className={getStatusBadgeClass(status)}>
            {statusLabel(status)}
          </span>
        </div>
      </div>

      {booking?.venueId && (
        <div className="booking-card-venue">
          {venueLoading ? (
            <div className="booking-venue-loading">Loading venue details...</div>
          ) : venue ? (
            <div className="booking-venue-info">
              <div className="booking-venue-name">{venue.name}</div>
              <div className="booking-venue-location">{venue.location}</div>
              {venue.services?.length > 0 && (
                <div className="booking-venue-services">
                  {venue.services.slice(0, 3).map((service) => (
                    <span key={service} className="pill pill-muted">
                      {service}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="booking-venue-info">
              <div className="booking-venue-name">Venue request:
                <span className="booking-venue-id"> {typeof booking?.venueId === 'object' ? booking?.venueId?.name || booking?.venueId?._id : booking?.venueId}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {booking?.description && (
        <p className="booking-card-description">{booking.description}</p>
      )}

      {isOwnerView && status === "pending" && (
        <div className="booking-card-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onApprove?.(id)}
          >
            Approve
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onReject?.(id)}
          >
            Reject
          </button>
        </div>
      )}

      {isOwnerView && booking?.userId && (
        <div className="booking-card-footer">
          <span className="text-sm text-muted">
            Requested by: {booking.userId}
          </span>
        </div>
      )}
    </article>
  );
}

export default BookingCard;

