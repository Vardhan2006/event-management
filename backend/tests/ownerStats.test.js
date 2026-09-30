const request = require("supertest");
const app = require("../app");
const Booking = require("../models/Booking");
const { connectDB, clearDB, closeDB } = require("./setup/db");

describe("Owner Dashboard Stats Endpoint Tests (Block 5)", () => {
  let ownerAToken, ownerAUser;
  let ownerBToken, ownerBUser;
  let userToken, normalUser;
  let venueA1, venueA2, venueB1;

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
    // Register Owner A & Owner B & User
    const resA = await request(app).post("/api/auth/register").send({
      name: "Owner A",
      email: "ownera@example.com",
      password: "password123",
      role: "owner",
    });
    ownerAToken = resA.body.token;
    ownerAUser = resA.body.user;

    const resB = await request(app).post("/api/auth/register").send({
      name: "Owner B",
      email: "ownerb@example.com",
      password: "password123",
      role: "owner",
    });
    ownerBToken = resB.body.token;
    ownerBUser = resB.body.user;

    const resUser = await request(app).post("/api/auth/register").send({
      name: "Normal User",
      email: "user@example.com",
      password: "password123",
      role: "user",
    });
    userToken = resUser.body.token;
    normalUser = resUser.body.user;

    // Create Venues
    const vA1Res = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerAToken}`)
      .send({
        name: "Venue A1",
        location: "City A",
        capacity: 100,
        pricePerDay: 500,
        description: "Venue A1 desc",
      });
    venueA1 = vA1Res.body;

    const vA2Res = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerAToken}`)
      .send({
        name: "Venue A2",
        location: "City A",
        capacity: 200,
        pricePerDay: 1000,
        description: "Venue A2 desc",
      });
    venueA2 = vA2Res.body;

    const vB1Res = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerBToken}`)
      .send({
        name: "Venue B1",
        location: "City B",
        capacity: 300,
        pricePerDay: 1500,
        description: "Venue B1 desc",
      });
    venueB1 = vB1Res.body;
  });

  it("should return accurate owner stats including venue counts and zero-filled booking statuses", async () => {
    // Create 2 pending bookings for Owner A
    await Booking.create({
      userId: normalUser._id,
      venueId: venueA1._id,
      ownerId: ownerAUser._id,
      title: "Pending Booking A1",
      eventDate: new Date("2026-11-10T00:00:00.000Z"),
      totalPrice: 500,
      status: "pending",
    });

    await Booking.create({
      userId: normalUser._id,
      venueId: venueA2._id,
      ownerId: ownerAUser._id,
      title: "Pending Booking A2",
      eventDate: new Date("2026-11-15T00:00:00.000Z"),
      totalPrice: 1000,
      status: "pending",
    });

    // Create 1 approved booking for Owner B
    await Booking.create({
      userId: normalUser._id,
      venueId: venueB1._id,
      ownerId: ownerBUser._id,
      title: "Approved Booking B1",
      eventDate: new Date("2026-11-20T00:00:00.000Z"),
      totalPrice: 1500,
      status: "approved",
    });

    const resA = await request(app)
      .get("/api/owner/stats")
      .set("Authorization", `Bearer ${ownerAToken}`);

    expect(resA.statusCode).toBe(200);
    expect(resA.body).toEqual({
      venues: 2,
      bookings: {
        pending: 2,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        total: 2,
      },
    });

    const resB = await request(app)
      .get("/api/owner/stats")
      .set("Authorization", `Bearer ${ownerBToken}`);

    expect(resB.statusCode).toBe(200);
    expect(resB.body).toEqual({
      venues: 1,
      bookings: {
        pending: 0,
        approved: 1,
        rejected: 0,
        cancelled: 0,
        total: 1,
      },
    });
  });

  it("should update stats dynamically after a booking approval", async () => {
    const booking = await Booking.create({
      userId: normalUser._id,
      venueId: venueA1._id,
      ownerId: ownerAUser._id,
      title: "Approval Test",
      eventDate: new Date("2026-12-01T00:00:00.000Z"),
      totalPrice: 500,
      status: "pending",
    });

    let res = await request(app)
      .get("/api/owner/stats")
      .set("Authorization", `Bearer ${ownerAToken}`);
    expect(res.body.bookings.pending).toBe(1);
    expect(res.body.bookings.approved).toBe(0);

    // Approve booking
    await request(app)
      .patch(`/api/bookings/${booking._id}/status`)
      .set("Authorization", `Bearer ${ownerAToken}`)
      .send({ status: "approved" });

    res = await request(app)
      .get("/api/owner/stats")
      .set("Authorization", `Bearer ${ownerAToken}`);
    expect(res.body.bookings.pending).toBe(0);
    expect(res.body.bookings.approved).toBe(1);
  });

  it("should return 403 for user role and 401 for unauthenticated calls", async () => {
    const resUser = await request(app)
      .get("/api/owner/stats")
      .set("Authorization", `Bearer ${userToken}`);
    expect(resUser.statusCode).toBe(403);

    const resNoAuth = await request(app).get("/api/owner/stats");
    expect(resNoAuth.statusCode).toBe(401);
  });
});
