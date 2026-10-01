function formatDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function statusBadge(status) {
  const s = (status || "pending").toLowerCase();
  if (s === "approved") return <span className="badge badge-approved">Approved</span>;
  if (s === "rejected") return <span className="badge badge-rejected">Rejected</span>;
  if (s === "cancelled") return <span className="badge badge-cancelled">Cancelled</span>;
  return <span className="badge badge-pending">Pending</span>;
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
    <article className="card stack" style={{ border: "1px solid var(--line-soft)" }}>
      {/* Header Row */}
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <div>
          <span className="eyebrow">Booking #{String(id).slice(-6)}</span>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{booking?.title || "Venue Booking"}</h3>
        </div>
        {statusBadge(status)}
      </div>

      {/* Details Box */}
      <div className="stack-sm" style={{ padding: 16, background: "var(--bg)", borderRadius: "var(--radius-card)" }}>
        <div className="row-between">
          <div>
            <span className="eyebrow" style={{ fontSize: 11 }}>Venue Space</span>
            <strong style={{ display: "block", fontSize: 15 }}>{venueName}</strong>
            <span className="text-muted text-sm">{venueLocation}</span>
          </div>

          <div style={{ textAlign: "right" }}>
            <span className="eyebrow" style={{ fontSize: 11 }}>Event Date</span>
            <strong style={{ display: "block", fontSize: 15 }}>{formatDate(booking?.eventDate)}</strong>
            {booking?.totalPrice !== undefined && (
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                ${Number(booking.totalPrice).toLocaleString()} total
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notes / Special Requests */}
      {(booking?.notes || booking?.description) && (
        <div className="stack-sm">
          <span className="eyebrow" style={{ fontSize: 11 }}>Notes / Requests</span>
          <p className="text-muted text-sm" style={{ background: "var(--surface)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line-soft)" }}>
            {booking.notes || booking.description}
          </p>
        </div>
      )}

      {/* Footer Info for Owner */}
      {isOwnerView && customerName && (
        <div className="row-between text-sm" style={{ paddingTop: 8, borderTop: "1px solid var(--line-soft)" }}>
          <span className="text-muted">Requested by: <strong style={{ color: "var(--ink)" }}>{customerName}</strong></span>
        </div>
      )}

      {/* Owner Action Buttons */}
      {isOwnerView && status === "pending" && (
        <div className="row" style={{ gap: 8, marginTop: 4 }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onApprove?.(id)}
            style={{ flex: 1 }}
          >
            Approve Request
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onReject?.(id)}
            style={{ flex: 1 }}
          >
            Reject
          </button>
        </div>
      )}

      {/* User Action Button */}
      {!isOwnerView && (status === "pending" || status === "approved") && (
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onCancel?.(id)}
          >
            Cancel Booking
          </button>
        </div>
      )}
    </article>
  );
}

export default BookingCard;
