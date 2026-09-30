const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Venue = require("../models/Venue");
const { connectDB, clearDB, closeDB } = require("./setup/db");

// Mock multer upload middleware to prevent Cloudinary network requests
jest.mock("../middleware/upload", () => {
  return {
    array: () => (req, res, next) => {
      if (req.headers["x-simulate-image"] === "true") {
        req.files = [
          {
            fieldname: "images",
            originalname: "venue.jpg",
            path: "https://res.cloudinary.com/demo/image/upload/v123/venue.jpg",
            secure_url: "https://res.cloudinary.com/demo/image/upload/v123/venue.jpg",
          },
        ];
      } else if (!req.files) {
        req.files = [];
      }
      next();
    },
  };
});

describe("Venue Management Integration Tests (Block 2)", () => {
  let ownerAToken, ownerAUser;
  let ownerBToken, ownerBUser;
  let normalUserToken, normalUser;

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

    // Register Normal User
    const resUser = await request(app).post("/api/auth/register").send({
      name: "Normal User",
      email: "user@example.com",
      password: "password123",
      role: "user",
    });
    normalUserToken = resUser.body.token;
    normalUser = resUser.body.user;
  });

  describe("POST /api/venues (Creation)", () => {
    it("should allow an owner to create a venue without images and set ownerId to logged-in user id", async () => {
      const payload = {
        name: "Grand Ballroom",
        location: "New York",
        capacity: 500,
        pricePerDay: 2500,
        description: "Elegant ballroom for grand celebrations",
        services: ["Catering", "Decoration"],
      };

      const res = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.name).toBe("Grand Ballroom");
      expect(String(res.body.ownerId)).toBe(String(ownerAUser._id));
      expect(res.body.images).toEqual([]);

      const dbVenue = await Venue.findById(res.body._id);
      expect(dbVenue).not.toBeNull();
      expect(String(dbVenue.ownerId)).toBe(String(ownerAUser._id));
    });

    it("should allow an owner to create a venue with simulated image uploads", async () => {
      const payload = {
        name: "Ocean View Hall",
        location: "Miami",
        capacity: 300,
        pricePerDay: 1800,
        description: "Beautiful seaside venue",
      };

      const res = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .set("x-simulate-image", "true")
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.images.length).toBe(1);
      expect(res.body.images[0]).toContain("cloudinary");
    });

    it("should ignore any fake ownerId sent in request body", async () => {
      const fakeOwnerId = new mongoose.Types.ObjectId().toString();
      const payload = {
        name: "Fake Owner Venue",
        location: "Chicago",
        capacity: 200,
        pricePerDay: 1000,
        description: "Testing fake ownerId stripping",
        ownerId: fakeOwnerId,
      };

      const res = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(String(res.body.ownerId)).toBe(String(ownerAUser._id));
      expect(String(res.body.ownerId)).not.toBe(fakeOwnerId);
    });

    it("should return 403 for user role and 401 for unauthenticated request", async () => {
      const payload = {
        name: "Unauthorized Venue",
        location: "Dallas",
        capacity: 100,
        pricePerDay: 500,
        description: "Should fail creation",
      };

      const userRes = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${normalUserToken}`)
        .send(payload);

      expect(userRes.statusCode).toBe(403);
      expect(userRes.body).toEqual({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
        },
      });

      const noAuthRes = await request(app).post("/api/venues").send(payload);

      expect(noAuthRes.statusCode).toBe(401);
      expect(noAuthRes.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    });

    it("should return 400 VALIDATION_ERROR on missing fields or negative price", async () => {
      const resMissingName = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({
          location: "Dallas",
          capacity: 100,
          pricePerDay: 500,
          description: "No name provided",
        });

      expect(resMissingName.statusCode).toBe(400);
      expect(resMissingName.body.error.code).toBe("VALIDATION_ERROR");

      const resNegativePrice = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({
          name: "Negative Price Venue",
          location: "Dallas",
          capacity: 100,
          pricePerDay: -50,
          description: "Invalid price",
        });

      expect(resNegativePrice.statusCode).toBe(400);
      expect(resNegativePrice.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/venues & GET /api/venues/mine (Listings)", () => {
    let venueA1, venueA2, venueB1;

    beforeEach(async () => {
      const resA1 = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({
          name: "Venue A1",
          location: "City A",
          capacity: 100,
          pricePerDay: 500,
          description: "Venue A1 desc",
        });
      venueA1 = resA1.body;

      const resA2 = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({
          name: "Venue A2",
          location: "City A",
          capacity: 200,
          pricePerDay: 1000,
          description: "Venue A2 desc",
        });
      venueA2 = resA2.body;

      const resB1 = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerBToken}`)
        .send({
          name: "Venue B1",
          location: "City B",
          capacity: 300,
          pricePerDay: 1500,
          description: "Venue B1 desc",
        });
      venueB1 = resB1.body;
    });

    it("should allow public GET /api/venues without token returning all venues as array", async () => {
      const res = await request(app).get("/api/venues");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });

    it("should allow public GET /api/venues/:id without token", async () => {
      const res = await request(app).get(`/api/venues/${venueA1._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Venue A1");
    });

    it("should return only caller's venues for GET /api/venues/mine", async () => {
      const resMineA = await request(app)
        .get("/api/venues/mine")
        .set("Authorization", `Bearer ${ownerAToken}`);

      expect(resMineA.statusCode).toBe(200);
      expect(Array.isArray(resMineA.body)).toBe(true);
      expect(resMineA.body.length).toBe(2);
      expect(resMineA.body.map((v) => v.name)).toEqual(
        expect.arrayContaining(["Venue A1", "Venue A2"])
      );

      const resMineB = await request(app)
        .get("/api/venues/mine")
        .set("Authorization", `Bearer ${ownerBToken}`);

      expect(resMineB.statusCode).toBe(200);
      expect(resMineB.body.length).toBe(1);
      expect(resMineB.body[0].name).toBe("Venue B1");
    });

    it("should return 400 INVALID_ID for malformed ID and 404 NOT_FOUND for non-existent valid ObjectId", async () => {
      const resInvalid = await request(app).get("/api/venues/invalid-id-format");

      expect(resInvalid.statusCode).toBe(400);
      expect(resInvalid.body).toEqual({
        error: {
          code: "INVALID_ID",
          message: "Invalid venue ID format",
        },
      });

      const fakeValidId = new mongoose.Types.ObjectId().toString();
      const resNonExistent = await request(app).get(`/api/venues/${fakeValidId}`);

      expect(resNonExistent.statusCode).toBe(404);
      expect(resNonExistent.body).toEqual({
        error: {
          code: "NOT_FOUND",
          message: "Venue not found",
        },
      });
    });
  });

  describe("PATCH /api/venues/:id & DELETE /api/venues/:id (Ownership & Mutate)", () => {
    let venueA;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/venues")
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({
          name: "Original Venue A",
          location: "Location A",
          capacity: 100,
          pricePerDay: 500,
          description: "Original description",
        });
      venueA = res.body;
    });

    it("should reject Owner B PATCH and DELETE on Owner A's venue with 403 and keep venue unchanged", async () => {
      const patchRes = await request(app)
        .patch(`/api/venues/${venueA._id}`)
        .set("Authorization", `Bearer ${ownerBToken}`)
        .send({ name: "Hacked Name" });

      expect(patchRes.statusCode).toBe(403);
      expect(patchRes.body).toEqual({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to modify this venue",
        },
      });

      const deleteRes = await request(app)
        .delete(`/api/venues/${venueA._id}`)
        .set("Authorization", `Bearer ${ownerBToken}`);

      expect(deleteRes.statusCode).toBe(403);
      expect(deleteRes.body).toEqual({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to delete this venue",
        },
      });

      // Confirm DB document is intact and unchanged
      const dbVenue = await Venue.findById(venueA._id);
      expect(dbVenue).not.toBeNull();
      expect(dbVenue.name).toBe("Original Venue A");
    });

    it("should allow Owner A to PATCH own venue successfully", async () => {
      const patchRes = await request(app)
        .patch(`/api/venues/${venueA._id}`)
        .set("Authorization", `Bearer ${ownerAToken}`)
        .send({ name: "Updated Venue A Name", pricePerDay: 750 });

      expect(patchRes.statusCode).toBe(200);
      expect(patchRes.body.name).toBe("Updated Venue A Name");
      expect(patchRes.body.pricePerDay).toBe(750);

      const dbVenue = await Venue.findById(venueA._id);
      expect(dbVenue.name).toBe("Updated Venue A Name");
    });

    it("should allow Owner A to DELETE own venue successfully", async () => {
      const deleteRes = await request(app)
        .delete(`/api/venues/${venueA._id}`)
        .set("Authorization", `Bearer ${ownerAToken}`);

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body).toEqual({
        message: "Venue deleted",
        id: venueA._id,
      });

      const dbVenue = await Venue.findById(venueA._id);
      expect(dbVenue).toBeNull();
    });
  });
});
