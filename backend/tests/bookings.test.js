const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");
const { connectDB, clearDB, closeDB } = require("./setup/db");

// Helper to format Date to YYYY-MM-DD in UTC
function getFutureDateString(daysAhead = 30) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

describe("Booking Lifecycle Integration Tests (Block 3)", () => {
  let ownerAToken, ownerAUser;
  let ownerBToken, ownerBUser;
  let userAToken, userAUser;
  let userBToken, userBUser;
  let venueA;

  beforeAll(async () => {
    await connectDB();
    await Booking.init(); // Build indexes including partial unique index
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    // Register Owner A
    const resA = await request(app).post("/api/auth/register").send({
      name: "Owner A",
      email: "ownera@example.com",
      password: "password123",
      role: "owner",
    });
    ownerAToken = resA.body.token;
    ownerAUser = resA.body.user;

    // Register Owner B
    const resB = await request(app).post("/api/auth/register").send({
      name: "Owner B",
      email: "ownerb@example.com",
      password: "password123",
      role: "owner",
    });
    ownerBToken = resB.body.token;
    ownerBUser = resB.body.user;

    // Register User A
    const resUserA = await request(app).post("/api/auth/register").send({
      name: "User A",
      email: "usera@example.com",
      password: "password123",
      role: "user",
    });
    userAToken = resUserA.body.token;
    userAUser = resUserA.body.user;

    // Register User B
    const resUserB = await request(app).post("/api/auth/register").send({
      name: "User B",
      email: "userb@example.com",
      password: "password123",
      role: "user",
    });
    userBToken = resUserB.body.token;
    userBUser = resUserB.body.user;

    // Create Venue A owned by Owner A
    const resVenue = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerAToken}`)
      .send({
        name: "Grand Ballroom A",
        location: "Chicago",
        capacity: 400,
        pricePerDay: 2500,
        description: "Grand venue for testing",
      });
    venueA = resVenue.body;
  });

  describe("POST /api/bookings (Creation & Validation)", () => {
    it("should allow a user to create a booking with populated ownerId and totalPrice, ignoring body userId", async () => {
      const futureDate = getFutureDateString(10);
      const fakeUserId = new mongoose.Types.ObjectId().toString();

      const payload = {
        venueId: venueA._id,
        eventDate: futureDate,
        title: "Annual Tech Conference",
        notes: "Need catering and AV",
        userId: fakeUserId, // fake userId to test stripping
      };

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.title).toBe("Annual Tech Conference");
      expect(res.body.totalPrice).toBe(2500);
      expect(String(res.body.ownerId)).toBe(String(ownerAUser._id));
      expect(String(res.body.userId)).toBe(String(userAUser._id));
      expect(String(res.body.userId)).not.toBe(fakeUserId);
    });

    it("should reject booking creation from owner (403) and unauthenticated (401)", async () => {
      const futureDate = getFutureDateString(15);
      const payload = {
        venueId: venueA._id,
        eventDate: futureDate,
        title: "Owner Booking Attempt",
      };

      const ownerRes = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send(payload);

      expect(ownerRes.statusCode).toBe(403);
      expect(ownerRes.body.error.code).toBe("FORBIDDEN");

      const noAuthRes = await request(app).post("/api/bookings").send(payload);

      expect(noAuthRes.statusCode).toBe(401);
      expect(noAuthRes.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should reject past dates, malformed dates, and Feb 30", async () => {
      // Past date
      const pastRes = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA._id,
          eventDate: "2020-01-01",
          title: "Past Event",
        });

      expect(pastRes.statusCode).toBe(400);
      expect(pastRes.body.error.code).toBe("PAST_DATE");

      // Malformed date
      const malformedRes = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA._id,
          eventDate: "not-a-date-format",
          title: "Malformed Event",
        });

      expect(malformedRes.statusCode).toBe(400);
      expect(malformedRes.body.error.code).toBe("VALIDATION_ERROR");

      // Invalid calendar date Feb 30
      const feb30Res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA._id,
          eventDate: "2026-02-30",
          title: "Feb 30 Event",
        });

      expect(feb30Res.statusCode).toBe(400);
      expect(feb30Res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should handle duplicate pending requests by same user (409) while allowing different users to request same date", async () => {
      const futureDate = getFutureDateString(20);

      // User A creates booking 1
      const res1 = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA._id,
          eventDate: futureDate,
          title: "User A Booking 1",
        });

      expect(res1.statusCode).toBe(201);

      // User A attempts duplicate booking 2 for same venue + date
      const res2 = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA._id,
          eventDate: futureDate,
          title: "User A Booking 2",
        });

      expect(res2.statusCode).toBe(409);
      expect(res2.body.error.code).toBe("DUPLICATE_REQUEST");

      // User B creates booking for same venue + date (allowed as pending)
      const resUserB = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userBToken}`)
        .send({
          venueId: venueA._id,
          eventDate: futureDate,
          title: "User B Booking",
        });

      expect(resUserB.statusCode).toBe(201);
      expect(resUserB.body.status).toBe("pending");
    });
  });

  describe("PATCH /api/bookings/:id/status (Review Workflow)", () => {
    let bookingUserA, bookingUserB, futureDate;

    beforeEach(async () => {
      futureDate = getFutureDateString(25);

      const resA = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA._id,
          eventDate: futureDate,
          title: "User A Request",
        });
      bookingUserA = resA.body;

      const resB = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userBToken}`)
        .send({
          venueId: venueA._id,
          eventDate: futureDate,
          title: "User B Request",
        });
      bookingUserB = resB.body;
    });

    it("should allow owner to approve one request and auto-reject other pending requests for same date", async () => {
      const approveRes = await request(app)
        .patch(`/api/bookings/${bookingUserA._id}/status`)
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({ status: "approved" });

      expect(approveRes.statusCode).toBe(200);
      expect(approveRes.body.status).toBe("approved");

      // Verify User B's pending request was automatically rejected in DB
      const dbBookingB = await Booking.findById(bookingUserB._id);
      expect(dbBookingB.status).toBe("rejected");
    });

    it("should reject new requests for an approved date with 409 DATE_UNAVAILABLE", async () => {
      await request(app)
        .patch(`/api/bookings/${bookingUserA._id}/status`)
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({ status: "approved" });

      const newRes = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userBToken}`)
        .send({
          venueId: venueA._id,
          eventDate: futureDate,
          title: "Late Request",
        });

      expect(newRes.statusCode).toBe(409);
      expect(newRes.body.error.code).toBe("DATE_UNAVAILABLE");
    });

    it("should return 403 when Owner B or a User attempts to manage Owner A's booking", async () => {
      const ownerBRes = await request(app)
        .patch(`/api/bookings/${bookingUserA._id}/status`)
        .set("Authorization", `Bearer ${ownerBToken}`)
        .send({ status: "approved" });

      expect(ownerBRes.statusCode).toBe(403);
      expect(ownerBRes.body.error.code).toBe("FORBIDDEN");

      const userRes = await request(app)
        .patch(`/api/bookings/${bookingUserA._id}/status`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ status: "approved" });

      expect(userRes.statusCode).toBe(403);
      expect(userRes.body.error.code).toBe("FORBIDDEN");
    });

    it("should return 409 INVALID_TRANSITION when reviewing a non-pending booking", async () => {
      await request(app)
        .patch(`/api/bookings/${bookingUserA._id}/status`)
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({ status: "approved" });

      const reApproveRes = await request(app)
        .patch(`/api/bookings/${bookingUserA._id}/status`)
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({ status: "rejected" });

      expect(reApproveRes.statusCode).toBe(409);
      expect(reApproveRes.body.error.code).toBe("INVALID_TRANSITION");
    });

    it("RACE TEST: simultaneous approval of two pending bookings resulting in exactly one approved and one 409", async () => {
      const dateRace = getFutureDateString(40);

      // Create two pending bookings directly in DB to bypass serial validation
      const dateObj = new Date(dateRace + "T00:00:00.000Z");
      const b1 = await Booking.create({
        userId: userAUser._id,
        venueId: venueA._id,
        ownerId: ownerAUser._id,
        title: "Race Request 1",
        eventDate: dateObj,
        totalPrice: 2500,
        status: "pending",
      });

      const b2 = await Booking.create({
        userId: userBUser._id,
        venueId: venueA._id,
        ownerId: ownerAUser._id,
        title: "Race Request 2",
        eventDate: dateObj,
        totalPrice: 2500,
        status: "pending",
      });

      // Fire simultaneous approval requests
      const [res1, res2] = await Promise.all([
        request(app)
          .patch(`/api/bookings/${b1._id}/status`)
          .set("Authorization", `Bearer ${ownerAToken}`)
          .send({ status: "approved" }),
        request(app)
          .patch(`/api/bookings/${b2._id}/status`)
          .set("Authorization", `Bearer ${ownerAToken}`)
          .send({ status: "approved" }),
      ]);

      const statusCodes = [res1.statusCode, res2.statusCode].sort();
      expect(statusCodes).toEqual([200, 409]);

      const approvedCount = await Booking.countDocuments({
        venueId: venueA._id,
        eventDate: dateObj,
        status: "approved",
      });
      expect(approvedCount).toBe(1);
    });
  });

  describe("PATCH /api/bookings/:id/cancel (Cancellation)", () => {
    let booking;

    beforeEach(async () => {
      const futureDate = getFutureDateString(35);
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA._id,
          eventDate: futureDate,
          title: "User A Booking to Cancel",
        });
      booking = res.body;
    });

    it("should allow user to cancel own booking and free the date for new bookings", async () => {
      const cancelRes = await request(app)
        .patch(`/api/bookings/${booking._id}/cancel`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(cancelRes.statusCode).toBe(200);
      expect(cancelRes.body.status).toBe("cancelled");

      // Verify date is requestable again
      const newRes = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userBToken}`)
        .send({
          venueId: venueA._id,
          eventDate: getFutureDateString(35),
          title: "New Booking After Cancel",
        });

      expect(newRes.statusCode).toBe(201);
    });

    it("should return 403 when User B tries to cancel User A's booking", async () => {
      const cancelRes = await request(app)
        .patch(`/api/bookings/${booking._id}/cancel`)
        .set("Authorization", `Bearer ${userBToken}`);

      expect(cancelRes.statusCode).toBe(403);
      expect(cancelRes.body.error.code).toBe("FORBIDDEN");
    });
  });

  describe("GET /api/bookings/mine & GET /api/bookings/owner (Listings)", () => {
    beforeEach(async () => {
      const futureDate = getFutureDateString(50);
      await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA._id,
          eventDate: futureDate,
          title: "Listing Test Booking",
        });
    });

    it("/mine returns only caller's bookings; /owner returns only bookings for caller's venues", async () => {
      const mineRes = await request(app)
        .get("/api/bookings/mine")
        .set("Authorization", `Bearer ${userAToken}`);

      expect(mineRes.statusCode).toBe(200);
      expect(Array.isArray(mineRes.body)).toBe(true);
      expect(mineRes.body.length).toBe(1);
      expect(mineRes.body[0].venueId).toHaveProperty("name");

      const ownerRes = await request(app)
        .get("/api/bookings/owner")
        .set("Authorization", `Bearer ${ownerAToken}`);

      expect(ownerRes.statusCode).toBe(200);
      expect(Array.isArray(ownerRes.body)).toBe(true);
      expect(ownerRes.body.length).toBe(1);
      expect(ownerRes.body[0].userId).toHaveProperty("email");
    });

    it("old /api/events endpoint returns 404", async () => {
      const res = await request(app).get("/api/events");
      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
