const request = require("supertest");
const app = require("../app");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");
const { connectDB, clearDB, closeDB } = require("./setup/db");
const { parseDateOnly } = require("../utils/dates");

describe("Venue Delete Cascade Rule & Snapshot Tests (Block 6)", () => {
  let ownerToken, userToken, ownerId, userId, venueId;

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    // Register owner
    const ownerRes = await request(app).post("/api/auth/register").send({
      name: "Venue Owner",
      email: "deleteowner@example.com",
      password: "password123",
      role: "owner",
    });
    ownerToken = ownerRes.body.token;
    ownerId = ownerRes.body.user._id;

    // Register user
    const userRes = await request(app).post("/api/auth/register").send({
      name: "Booking User",
      email: "deleteuser@example.com",
      password: "password123",
      role: "user",
    });
    userToken = userRes.body.token;
    userId = userRes.body.user._id;

    // Create a venue
    const venueRes = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Cascade Royal Hall",
        location: "Hyderabad",
        capacity: 1000,
        pricePerDay: 50000,
        description: "Royal hall description",
      });

    venueId = venueRes.body._id;
  });

  it("should refuse deletion (409 VENUE_HAS_UPCOMING_BOOKINGS) if an approved booking exists for today or future", async () => {
    const futureDate = "2026-10-15";
    const bookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        venueId,
        eventDate: futureDate,
        title: "Upcoming Approved Wedding",
      });

    const bookingId = bookingRes.body._id;

    // Owner approves the booking
    await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "approved" });

    // Attempt to delete venue
    const deleteRes = await request(app)
      .delete(`/api/venues/${venueId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(deleteRes.statusCode).toBe(409);
    expect(deleteRes.body.error.code).toBe("VENUE_HAS_UPCOMING_BOOKINGS");

    // Verify venue still exists
    const checkVenue = await Venue.findById(venueId);
    expect(checkVenue).not.toBeNull();
  });

  it("should delete venue if only pending bookings exist, cancel pending bookings, and retain historical bookings with venueSnapshot", async () => {
    // 1. Create a pending booking for future date
    const pendingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        venueId,
        eventDate: "2026-10-20",
        title: "Future Pending Function",
      });
    const pendingBookingId = pendingRes.body._id;

    // 2. Create a past approved booking directly in DB to simulate historical booking
    const pastDate = new Date("2020-01-01T00:00:00.000Z");
    const pastBooking = await Booking.create({
      userId,
      venueId,
      ownerId,
      title: "Historical Past Function",
      eventDate: pastDate,
      totalPrice: 50000,
      status: "approved",
      venueSnapshot: {
        name: "Cascade Royal Hall",
        location: "Hyderabad",
      },
    });

    // 3. Delete venue
    const deleteRes = await request(app)
      .delete(`/api/venues/${venueId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Venue deleted");

    // 4. Verify venue is deleted
    const checkVenue = await Venue.findById(venueId);
    expect(checkVenue).toBeNull();

    // 5. Verify pending booking status was changed to 'cancelled'
    const updatedPending = await Booking.findById(pendingBookingId);
    expect(updatedPending.status).toBe("cancelled");

    // 6. Verify historical booking is retained and accessible via GET /api/bookings/mine & /api/bookings/:id
    const userBookingsRes = await request(app)
      .get("/api/bookings/mine")
      .set("Authorization", `Bearer ${userToken}`);

    expect(userBookingsRes.statusCode).toBe(200);
    const pastInList = userBookingsRes.body.find(
      (b) => b._id === String(pastBooking._id)
    );
    expect(pastInList).toBeDefined();
    expect(pastInList.venueId.name).toBe("Cascade Royal Hall");
    expect(pastInList.venueId.location).toBe("Hyderabad");

    const singleBookingRes = await request(app)
      .get(`/api/bookings/${pastBooking._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(singleBookingRes.statusCode).toBe(200);
    expect(singleBookingRes.body.venueId.name).toBe("Cascade Royal Hall");
  });
});
