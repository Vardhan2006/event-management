const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");
const { seedDatabase } = require("../scripts/seed");
const { connectDB, clearDB, closeDB } = require("./setup/db");

describe("Database Seed Script Tests (Block 6)", () => {
  const originalEnv = process.env;

  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    process.env = { ...originalEnv };
    await clearDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  it("should refuse to run if SEED_CONFIRM=yes flag is missing", async () => {
    delete process.env.SEED_CONFIRM;
    process.env.NODE_ENV = "test";

    await expect(seedDatabase()).rejects.toThrow(
      "Missing SEED_CONFIRM=yes environment variable"
    );
  });

  it("should refuse to run if NODE_ENV=production", async () => {
    process.env.SEED_CONFIRM = "yes";
    process.env.NODE_ENV = "production";

    await expect(seedDatabase()).rejects.toThrow(
      "Refusing to run seed in production environment"
    );
  });

  it("should seed the database cleanly with expected record counts and allow login for all seeded users", async () => {
    process.env.SEED_CONFIRM = "yes";
    process.env.NODE_ENV = "test";

    const res = await seedDatabase();

    // Check counts
    const usersCount = await User.countDocuments();
    const venuesCount = await Venue.countDocuments();
    const bookingsCount = await Booking.countDocuments();

    expect(usersCount).toBe(4);
    expect(venuesCount).toBe(3);
    expect(bookingsCount).toBe(8);

    // Check login for all 4 users
    const credentials = [
      { email: "owner1@example.com", password: res.devPassword },
      { email: "owner2@example.com", password: res.devPassword },
      { email: "user1@example.com", password: res.devPassword },
      { email: "user2@example.com", password: res.devPassword },
    ];

    for (const cred of credentials) {
      const loginRes = await request(app).post("/api/auth/login").send(cred);
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.token).toBeDefined();
      expect(loginRes.body.user.email).toBe(cred.email);
    }
  });

  it("should be idempotent and safely re-runnable", async () => {
    process.env.SEED_CONFIRM = "yes";
    process.env.NODE_ENV = "test";

    // Run first time
    await seedDatabase();
    // Run second time
    await seedDatabase();

    const usersCount = await User.countDocuments();
    const venuesCount = await Venue.countDocuments();
    const bookingsCount = await Booking.countDocuments();

    expect(usersCount).toBe(4);
    expect(venuesCount).toBe(3);
    expect(bookingsCount).toBe(8);
  });
});
