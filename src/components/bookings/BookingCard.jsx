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

function BookingCard({ booking, onApprove, onReject, isOwnerView = false }) {
  const id = booking?._id || booking?.id;
  const status = booking?.status || "pending";

  return (
    <article className="booking-card">
      <div className="booking-card-header">
        <div>
          <h3 className="booking-card-title">{booking?.title}</h3>
          <div className="booking-card-meta">
            <span>{formatDate(booking?.eventDate)}</span>
            <span> · </span>
            <span>{statusLabel(status)}</span>
          </div>
        </div>
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
      </div>

      {booking?.description && (
        <p className="booking-card-description">{booking.description}</p>
      )}

      {booking?.userId && (
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

