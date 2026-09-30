const request = require("supertest");
const express = require("express");
const app = require("../app");
const { connectDB, clearDB, closeDB } = require("./setup/db");

describe("Hardening & Security Tests (Block 6)", () => {
  let ownerToken;

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  it("should return 400 clean for malformed JSON body", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ malformed json }");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("MALFORMED_JSON");
  });

  it("should return 404 JSON for unknown routes", async () => {
    const res = await request(app).get("/api/unknown-endpoint-route");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("should return generic 500 with no stack or internal details on forced internal error", async () => {
    // Create a temporary express app with a route that throws an unhandled error
    const testApp = express();
    testApp.use(express.json());
    testApp.get("/test-500", (req, res, next) => {
      next(new Error("Sensitive internal database connection failed: secret_db_key_123"));
    });
    const errorHandler = require("../middleware/errorHandler");
    testApp.use(errorHandler);

    const res = await request(testApp).get("/test-500");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    expect(res.body.error.message).toBe("Something went wrong");
    expect(JSON.stringify(res.body)).not.toContain("secret_db_key_123");
    expect(res.body.stack).toBeUndefined();
  });

  it("should return 400 for request bodies with operator injection keys like {$ne: ...}", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: { "$ne": "admin@example.com" },
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should include helmet security headers and respect CORS origin policy", async () => {
    const resAllowed = await request(app)
      .get("/api/venues")
      .set("Origin", "http://localhost:3000");

    expect(resAllowed.statusCode).toBe(200);
    expect(resAllowed.headers["x-content-type-options"]).toBe("nosniff");
    expect(resAllowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    );

    const resUnlisted = await request(app)
      .get("/api/venues")
      .set("Origin", "http://malicious-unlisted-domain.com");

    expect(resUnlisted.statusCode).toBe(403);
    expect(resUnlisted.body.error.code).toBe("CORS_ERROR");
  });

  it("should reject non-image uploads and oversized file uploads with 400", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      name: "Upload Owner",
      email: "uploadowner@example.com",
      password: "password123",
      role: "owner",
    });
    ownerToken = regRes.body.token;

    // Non-image file upload
    const resNonImage = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerToken}`)
      .field("name", "Test Venue")
      .field("location", "Test Location")
      .field("capacity", 100)
      .field("pricePerDay", 1000)
      .field("description", "Test Description")
      .attach("images", Buffer.from("Hello world text file"), "test.txt");

    expect(resNonImage.statusCode).toBe(400);
    expect(resNonImage.body.error).toBeDefined();

    // Oversized image upload (> 5MB)
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const resOversized = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerToken}`)
      .field("name", "Test Venue")
      .field("location", "Test Location")
      .field("capacity", 100)
      .field("pricePerDay", 1000)
      .field("description", "Test Description")
      .attach("images", largeBuffer, "large_image.png");

    expect(resOversized.statusCode).toBe(400);
    expect(resOversized.body.error).toBeDefined();
  });
});
