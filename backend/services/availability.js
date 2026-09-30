const Booking = require("../models/Booking");

async function getBookedDates(venueId, year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 0 : month;
  const end = new Date(Date.UTC(nextYear, nextMonth, 1, 0, 0, 0, 0));

  const bookings = await Booking.find({
    venueId,
    status: "approved",
    eventDate: { $gte: start, $lt: end },
  }).select("eventDate");

  const dateStrings = bookings.map((b) => {
    const d = new Date(b.eventDate);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });

  return dateStrings.sort();
}

async function isDateAvailable(venueId, date) {
  const approved = await Booking.findOne({
    venueId,
    status: "approved",
    eventDate: date,
  });
  return !approved;
}

module.exports = {
  getBookedDates,
  isDateAvailable,
};
