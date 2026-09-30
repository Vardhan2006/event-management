const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Booking = require("../models/Booking");
const { connectDB, clearDB, closeDB } = require("./setup/db");

describe("Contract Additions Integration Tests (Block 5)", () => {
  let ownerAToken, ownerAUser;
  let ownerBToken, ownerBUser;
  let userAToken, userAUser;
  let userBToken, userBUser;
  let venueA1, venueA2;

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
    // Register Owner A
    const resA = await request(app).post("/api/auth/register").send({
      name: "Owner Alice",
      email: "alice@example.com",
      password: "password123",
      role: "owner",
    });
    ownerAToken = resA.body.token;
    ownerAUser = resA.body.user;

    // Register Owner B
    const resB = await request(app).post("/api/auth/register").send({
      name: "Owner Bob",
      email: "bob@example.com",
      password: "password123",
      role: "owner",
    });
    ownerBToken = resB.body.token;
    ownerBUser = resB.body.user;

    // Register User A
    const resUserA = await request(app).post("/api/auth/register").send({
      name: "User Charlie",
      email: "charlie@example.com",
      password: "password123",
      role: "user",
    });
    userAToken = resUserA.body.token;
    userAUser = resUserA.body.user;

    // Register User B
    const resUserB = await request(app).post("/api/auth/register").send({
      name: "User David",
      email: "david@example.com",
      password: "password123",
      role: "user",
    });
    userBToken = resUserB.body.token;
    userBUser = resUserB.body.user;

    // Create Venues for Owner A
    const resV1 = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerAToken}`)
      .send({
        name: "Emerald Plaza",
        location: "Seattle",
        capacity: 300,
        pricePerDay: 1500,
        description: "Emerald Plaza Description",
      });
    venueA1 = resV1.body;

    const resV2 = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerAToken}`)
      .send({
        name: "Crystal Ballroom",
        location: "Seattle",
        capacity: 800,
        pricePerDay: 4000,
        description: "Crystal Ballroom Description",
      });
    venueA2 = resV2.body;
  });

  describe("GET /api/venues/meta", () => {
    it("should return meta stats for venues and not be shadowed by /:id", async () => {
      const res = await request(app).get("/api/venues/meta");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        locations: ["Seattle"],
        minPrice: 1500,
        maxPrice: 4000,
        maxCapacity: 800,
      });
    });

    it("should return zeroed defaults on an empty database", async () => {
      await clearDB();
      const res = await request(app).get("/api/venues/meta");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        locations: [],
        minPrice: 0,
        maxPrice: 0,
        maxCapacity: 0,
      });
    });
  });

  describe("GET /api/venues/:id (Owner info format)", () => {
    it("should include owner.name and owner.id but NOT expose owner email", async () => {
      const res = await request(app).get(`/api/venues/${venueA1._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("owner");
      expect(res.body.owner).toEqual({
        id: String(ownerAUser._id),
        name: "Owner Alice",
      });
      expect(res.body.owner.email).toBeUndefined();
      expect(String(res.body.ownerId)).toBe(String(ownerAUser._id));
    });
  });

  describe("GET /api/bookings/:id & GET /api/bookings/owner?venueId=", () => {
    let bookingA1;

    beforeEach(async () => {
      const resB = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA1._id,
          eventDate: "2026-11-25",
          title: "Charlie's Event",
        });
      bookingA1 = resB.body;
    });

    it("should allow booking's user and owner to read GET /api/bookings/:id, returning 403 for third parties", async () => {
      // User A (the booker) -> 200
      const resUserA = await request(app)
        .get(`/api/bookings/${bookingA1._id}`)
        .set("Authorization", `Bearer ${userAToken}`);
      expect(resUserA.statusCode).toBe(200);
      expect(resUserA.body._id).toBe(bookingA1._id);

      // Owner A (the venue owner) -> 200
      const resOwnerA = await request(app)
        .get(`/api/bookings/${bookingA1._id}`)
        .set("Authorization", `Bearer ${ownerAToken}`);
      expect(resOwnerA.statusCode).toBe(200);
      expect(resOwnerA.body._id).toBe(bookingA1._id);

      // User B (third party user) -> 403
      const resUserB = await request(app)
        .get(`/api/bookings/${bookingA1._id}`)
        .set("Authorization", `Bearer ${userBToken}`);
      expect(resUserB.statusCode).toBe(403);
      expect(resUserB.body.error.code).toBe("FORBIDDEN");

      // Owner B (third party owner) -> 403
      const resOwnerB = await request(app)
        .get(`/api/bookings/${bookingA1._id}`)
        .set("Authorization", `Bearer ${ownerBToken}`);
      expect(resOwnerB.statusCode).toBe(403);
      expect(resOwnerB.body.error.code).toBe("FORBIDDEN");
    });

    it("should return 400 for bad ID format and 404 if missing", async () => {
      const resBadId = await request(app)
        .get("/api/bookings/invalid-id-format")
        .set("Authorization", `Bearer ${userAToken}`);
      expect(resBadId.statusCode).toBe(400);
      expect(resBadId.body.error.code).toBe("INVALID_ID");

      const fakeValidId = new mongoose.Types.ObjectId().toString();
      const res404 = await request(app)
        .get(`/api/bookings/${fakeValidId}`)
        .set("Authorization", `Bearer ${userAToken}`);
      expect(res404.statusCode).toBe(404);
      expect(res404.body.error.code).toBe("NOT_FOUND");
    });

    it("should filter /api/bookings/owner correctly by ?venueId=", async () => {
      // Create a booking for venueA2 as well
      await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          venueId: venueA2._id,
          eventDate: "2026-11-28",
          title: "Charlie's Venue A2 Event",
        });

      // Filter by venueA1
      const resV1 = await request(app)
        .get(`/api/bookings/owner?venueId=${venueA1._id}`)
        .set("Authorization", `Bearer ${ownerAToken}`);

      expect(resV1.statusCode).toBe(200);
      expect(resV1.body.length).toBe(1);
      expect(resV1.body[0].title).toBe("Charlie's Event");

      // Filter by venueA2
      const resV2 = await request(app)
        .get(`/api/bookings/owner?venueId=${venueA2._id}`)
        .set("Authorization", `Bearer ${ownerAToken}`);

      expect(resV2.statusCode).toBe(200);
      expect(resV2.body.length).toBe(1);
      expect(resV2.body[0].title).toBe("Charlie's Venue A2 Event");
    });
  });
});
