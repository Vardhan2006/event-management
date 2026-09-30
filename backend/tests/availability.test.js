const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");
const { connectDB, clearDB, closeDB } = require("./setup/db");

describe("Venue Availability Endpoint Tests (Block 4)", () => {
  let ownerToken, ownerUser;
  let userToken, normalUser;
  let venue;

  beforeAll(async () => {
    await connectDB();
    await Booking.init();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    // Register Owner
    const resOwner = await request(app).post("/api/auth/register").send({
      name: "Availability Owner",
      email: "availowner@example.com",
      password: "password123",
      role: "owner",
    });
    ownerToken = resOwner.body.token;
    ownerUser = resOwner.body.user;

    // Register User
    const resUser = await request(app).post("/api/auth/register").send({
      name: "Availability User",
      email: "availuser@example.com",
      password: "password123",
      role: "user",
    });
    userToken = resUser.body.token;
    normalUser = resUser.body.user;

    // Create Venue
    const resVenue = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Sunset Pavilion",
        location: "San Diego",
        capacity: 250,
        pricePerDay: 1200,
        description: "Seaside pavilion for events",
      });
    venue = resVenue.body;
  });

  it("should return empty bookedDates array for a month with no bookings", async () => {
    const res = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-10`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      venueId: venue._id,
      month: "2026-10",
      bookedDates: [],
    });
  });

  it("should include ONLY approved bookings and ignore pending, rejected, and cancelled status", async () => {
    // 1. Approved
    await Booking.create({
      userId: normalUser._id,
      venueId: venue._id,
      ownerId: ownerUser._id,
      title: "Approved Event",
      eventDate: new Date("2026-10-10T00:00:00.000Z"),
      totalPrice: 1200,
      status: "approved",
    });

    // 2. Pending
    await Booking.create({
      userId: normalUser._id,
      venueId: venue._id,
      ownerId: ownerUser._id,
      title: "Pending Event",
      eventDate: new Date("2026-10-15T00:00:00.000Z"),
      totalPrice: 1200,
      status: "pending",
    });

    // 3. Rejected
    await Booking.create({
      userId: normalUser._id,
      venueId: venue._id,
      ownerId: ownerUser._id,
      title: "Rejected Event",
      eventDate: new Date("2026-10-20T00:00:00.000Z"),
      totalPrice: 1200,
      status: "rejected",
    });

    // 4. Cancelled
    await Booking.create({
      userId: normalUser._id,
      venueId: venue._id,
      ownerId: ownerUser._id,
      title: "Cancelled Event",
      eventDate: new Date("2026-10-25T00:00:00.000Z"),
      totalPrice: 1200,
      status: "cancelled",
    });

    const res = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-10`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.bookedDates).toEqual(["2026-10-10"]);
  });

  it("should immediately show an approved booking and remove a cancelled booking", async () => {
    const booking = await Booking.create({
      userId: normalUser._id,
      venueId: venue._id,
      ownerId: ownerUser._id,
      title: "Dynamic Event",
      eventDate: new Date("2026-10-12T00:00:00.000Z"),
      totalPrice: 1200,
      status: "pending",
    });

    // Initially pending -> empty bookedDates
    let res = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-10`
    );
    expect(res.body.bookedDates).toEqual([]);

    // Approve booking
    await request(app)
      .patch(`/api/bookings/${booking._id}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "approved" });

    // Now approved -> appears in bookedDates
    res = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-10`
    );
    expect(res.body.bookedDates).toEqual(["2026-10-12"]);

    // Cancel booking
    await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);

    // Now cancelled -> removed from bookedDates
    res = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-10`
    );
    expect(res.body.bookedDates).toEqual([]);
  });

  it("should strictly respect month boundaries (prev month end, requested month start/end, next month start)", async () => {
    const datesToCreate = [
      { date: "2026-09-30", title: "Prev Month Last Day" },
      { date: "2026-10-01", title: "Current Month First Day" },
      { date: "2026-10-31", title: "Current Month Last Day" },
      { date: "2026-11-01", title: "Next Month First Day" },
    ];

    for (const item of datesToCreate) {
      await Booking.create({
        userId: normalUser._id,
        venueId: venue._id,
        ownerId: ownerUser._id,
        title: item.title,
        eventDate: new Date(`${item.date}T00:00:00.000Z`),
        totalPrice: 1200,
        status: "approved",
      });
    }

    const res = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-10`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.bookedDates).toEqual(["2026-10-01", "2026-10-31"]);
  });

  it("should return sorted dates and handle a December query with year rollover boundary", async () => {
    const decDates = ["2026-12-25", "2026-12-05", "2026-12-31"];
    for (const d of decDates) {
      await Booking.create({
        userId: normalUser._id,
        venueId: venue._id,
        ownerId: ownerUser._id,
        title: `Dec Event ${d}`,
        eventDate: new Date(`${d}T00:00:00.000Z`),
        totalPrice: 1200,
        status: "approved",
      });
    }

    // January 1st of next year
    await Booking.create({
      userId: normalUser._id,
      venueId: venue._id,
      ownerId: ownerUser._id,
      title: "Jan Event 2027",
      eventDate: new Date("2027-01-01T00:00:00.000Z"),
      totalPrice: 1200,
      status: "approved",
    });

    const res = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-12`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.bookedDates).toEqual([
      "2026-12-05",
      "2026-12-25",
      "2026-12-31",
    ]);
  });

  it("should return 400 VALIDATION_ERROR for invalid month formats (2026-13, 2026-1, abc, missing)", async () => {
    const invalidMonths = ["2026-13", "2026-1", "abc"];
    for (const m of invalidMonths) {
      const res = await request(app).get(
        `/api/venues/${venue._id}/availability?month=${m}`
      );
      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    }

    const missingRes = await request(app).get(
      `/api/venues/${venue._id}/availability`
    );
    expect(missingRes.statusCode).toBe(400);
    expect(missingRes.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 404 for nonexistent venue and work publicly without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res404 = await request(app).get(
      `/api/venues/${fakeId}/availability?month=2026-10`
    );

    expect(res404.statusCode).toBe(404);
    expect(res404.body.error.code).toBe("NOT_FOUND");

    const publicRes = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-10`
    );
    expect(publicRes.statusCode).toBe(200);
  });

  it("CONSISTENCY TEST: POST /api/bookings for an approved date returns 409 and same date is listed by availability endpoint", async () => {
    const dateStr = "2026-10-18";

    // Approve booking for date
    await Booking.create({
      userId: normalUser._id,
      venueId: venue._id,
      ownerId: ownerUser._id,
      title: "Existing Approved Event",
      eventDate: new Date(`${dateStr}T00:00:00.000Z`),
      totalPrice: 1200,
      status: "approved",
    });

    // Attempting POST /api/bookings -> 409 DATE_UNAVAILABLE
    const postRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        venueId: venue._id,
        eventDate: dateStr,
        title: "Conflicting Request",
      });

    expect(postRes.statusCode).toBe(409);
    expect(postRes.body.error.code).toBe("DATE_UNAVAILABLE");

    // Availability endpoint returns date
    const availRes = await request(app).get(
      `/api/venues/${venue._id}/availability?month=2026-10`
    );

    expect(availRes.statusCode).toBe(200);
    expect(availRes.body.bookedDates).toContain(dateStr);
  });
});
