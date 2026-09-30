function formatDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0]; // YYYY-MM-DD UTC date format
}

function statusLabel(status) {
  if (!status) return "Pending";
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "cancelled") return "Cancelled";
  return status;
}

function getStatusBadgeClass(status) {
  if (!status) return "status-badge status-badge-pending";
  if (status === "pending") return "status-badge status-badge-pending";
  if (status === "approved") return "status-badge status-badge-approved";
  if (status === "rejected") return "status-badge status-badge-rejected";
  if (status === "cancelled") return "status-badge status-badge-cancelled";
  return "status-badge status-badge-pending";
}

function BookingCard({ booking, onApprove, onReject, onCancel, isOwnerView = false }) {
  const id = booking?._id || booking?.id;
  const status = booking?.status || "pending";

  const venueName =
    booking?.venueId?.name ||
    booking?.venueSnapshot?.name ||
    "Deleted Venue";

  const venueLocation =
    booking?.venueId?.location ||
    booking?.venueSnapshot?.location ||
    "Location unavailable";

  const customerName =
    booking?.userId?.name ||
    booking?.userId?.email ||
    (typeof booking?.userId === "string" ? booking?.userId : "Customer");

  return (
    <article className="booking-card card" style={{ marginBottom: 16 }}>
      <div className="booking-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="booking-card-title-section">
          <h3 className="booking-card-title" style={{ margin: "0 0 4px 0" }}>{booking?.title}</h3>
          <div className="booking-card-meta text-sm text-muted">
            <span>Date: {formatDate(booking?.eventDate)}</span>
            {booking?.totalPrice !== undefined && (
              <span style={{ marginLeft: 12 }}>Total: ${Number(booking.totalPrice).toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="booking-card-status">
          <span className={getStatusBadgeClass(status)} style={{ padding: "4px 8px", borderRadius: 4, fontWeight: "bold" }}>
            {statusLabel(status)}
          </span>
        </div>
      </div>

      <div className="booking-card-venue" style={{ marginTop: 12, padding: "8px 12px", background: "#f8f9fa", borderRadius: 6 }}>
        <div className="booking-venue-name" style={{ fontWeight: 600 }}>{venueName}</div>
        <div className="booking-venue-location text-sm text-muted">{venueLocation}</div>
      </div>

      {(booking?.notes || booking?.description) && (
        <p className="booking-card-description text-sm" style={{ marginTop: 12 }}>
          {booking.notes || booking.description}
        </p>
      )}

      {/* Owner Action Buttons */}
      {isOwnerView && status === "pending" && (
        <div className="booking-card-actions" style={{ marginTop: 16, display: "flex", gap: 8 }}>
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

      {/* User Action Button */}
      {!isOwnerView && (status === "pending" || status === "approved") && (
        <div className="booking-card-actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onCancel?.(id)}
            style={{ color: "#d32f2f" }}
          >
            Cancel Request
          </button>
        </div>
      )}

      {isOwnerView && customerName && (
        <div className="booking-card-footer text-sm text-muted" style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #eee" }}>
          Requested by: <strong>{customerName}</strong>
        </div>
      )}
    </article>
  );
}

export default BookingCard;
