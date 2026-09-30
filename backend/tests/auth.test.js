const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../models/User");
const { connectDB, clearDB, closeDB } = require("./setup/db");

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

describe("Authentication & Authorization Integration Tests", () => {
  describe("POST /api/auth/register", () => {
    it("should register a user successfully and return token with user object (no passwordHash)", async () => {
      const payload = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      };

      const res = await request(app).post("/api/auth/register").send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toMatchObject({
        name: "John Doe",
        email: "john@example.com",
        role: "user",
      });
      expect(res.body.user).toHaveProperty("_id");
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it("should register an owner successfully", async () => {
      const payload = {
        name: "Jane Owner",
        email: "jane@example.com",
        password: "password123",
        role: "owner",
      };

      const res = await request(app).post("/api/auth/register").send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe("owner");
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it("should reject registration with role 'admin' with 400 VALIDATION_ERROR", async () => {
      const payload = {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      };

      const res = await request(app).post("/api/auth/register").send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: expect.arrayContaining([
            expect.objectContaining({
              field: "role",
            }),
          ]),
        },
      });
    });

    it("should reject duplicate email (case insensitive) with 409 EMAIL_TAKEN", async () => {
      await request(app).post("/api/auth/register").send({
        name: "First User",
        email: "test@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Second User",
        email: "Test@Example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({
        error: {
          code: "EMAIL_TAKEN",
          message: "Email already in use",
        },
      });
    });

    it("should reject short password or invalid email with 400 VALIDATION_ERROR", async () => {
      const shortPassRes = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "valid@example.com",
        password: "123",
      });

      expect(shortPassRes.statusCode).toBe(400);
      expect(shortPassRes.body.error.code).toBe("VALIDATION_ERROR");

      const invalidEmailRes = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "invalid-email-format",
        password: "password123",
      });

      expect(invalidEmailRes.statusCode).toBe(400);
      expect(invalidEmailRes.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send({
        name: "Login User",
        email: "login@example.com",
        password: "password123",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toMatchObject({
        email: "login@example.com",
        name: "Login User",
      });
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it("should return identical 401 INVALID_CREDENTIALS for wrong password and unknown email", async () => {
      const wrongPassRes = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      const unknownEmailRes = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(wrongPassRes.statusCode).toBe(401);
      expect(unknownEmailRes.statusCode).toBe(401);

      const expectedError = {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      };

      expect(wrongPassRes.body).toEqual(expectedError);
      expect(unknownEmailRes.body).toEqual(expectedError);
    });
  });

  describe("GET /api/auth/me & Protect Middleware", () => {
    let validToken;
    let userDoc;

    beforeEach(async () => {
      const regRes = await request(app).post("/api/auth/register").send({
        name: "Auth User",
        email: "authuser@example.com",
        password: "password123",
      });
      validToken = regRes.body.token;
      userDoc = regRes.body.user;
    });

    it("should return user details with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("authuser@example.com");
    });

    it("should return 401 when token is missing", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    });

    it("should return 401 when token is malformed / garbage", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer garbage-token-12345");

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
      });
    });

    it("should return 401 when token is signed with a different secret", async () => {
      const wrongSecretToken = jwt.sign(
        { id: userDoc._id, role: "user" },
        "completely-different-secret-key-123"
      );

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${wrongSecretToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
      });
    });

    it("should return 401 when user associated with token has been deleted from DB", async () => {
      await User.findByIdAndDelete(userDoc._id);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "User no longer exists",
        },
      });
    });
  });

  describe("Authorize Middleware", () => {
    it("should return 403 for user role and 200 for owner role on owner-only route", async () => {
      const userReg = await request(app).post("/api/auth/register").send({
        name: "Normal User",
        email: "user@example.com",
        password: "password123",
        role: "user",
      });

      const ownerReg = await request(app).post("/api/auth/register").send({
        name: "Venue Owner",
        email: "owner@example.com",
        password: "password123",
        role: "owner",
      });

      const userRes = await request(app)
        .get("/api/auth/test-owner-only")
        .set("Authorization", `Bearer ${userReg.body.token}`);

      expect(userRes.statusCode).toBe(403);
      expect(userRes.body).toEqual({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
        },
      });

      const ownerRes = await request(app)
        .get("/api/auth/test-owner-only")
        .set("Authorization", `Bearer ${ownerReg.body.token}`);

      expect(ownerRes.statusCode).toBe(200);
      expect(ownerRes.body).toEqual({ message: "Owner access granted" });
    });
  });

  describe("Password Hashing in DB", () => {
    it("should verify that passwordHash in DB is not plaintext and bcrypt.compare succeeds", async () => {
      const plainPassword = "mySecretPassword123";
      const regRes = await request(app).post("/api/auth/register").send({
        name: "Hash Test User",
        email: "hashtest@example.com",
        password: plainPassword,
      });

      const userId = regRes.body.user._id;

      const dbUser = await User.findById(userId).select("+passwordHash");

      expect(dbUser).not.toBeNull();
      expect(dbUser.passwordHash).not.toBe(plainPassword);
      expect(
        dbUser.passwordHash.startsWith("$2a$") ||
          dbUser.passwordHash.startsWith("$2b$")
      ).toBe(true);

      const matches = await bcrypt.compare(plainPassword, dbUser.passwordHash);
      expect(matches).toBe(true);
    });
  });
});
