const request = require("supertest");
const app = require("../app");
const Venue = require("../models/Venue");
const { connectDB, clearDB, closeDB } = require("./setup/db");

describe("Venue Search, Filter, Sort, and Pagination Tests (Block 5)", () => {
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

  beforeEach(async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      name: "Search Owner",
      email: "searchowner@example.com",
      password: "password123",
      role: "owner",
    });
    ownerToken = regRes.body.token;

    // Create test venues with diverse names, locations, capacities, and prices
    await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Alpha Grand Hall (Center)",
        location: "New York",
        capacity: 500,
        pricePerDay: 2000,
        description: "Alpha hall description",
      });

    await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Beta Beach Resort",
        location: "Miami",
        capacity: 200,
        pricePerDay: 1500,
        description: "Beta resort description",
      });

    await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Gamma Studio (Special+Complex)",
        location: "New York",
        capacity: 100,
        pricePerDay: 800,
        description: "Gamma studio description",
      });

    await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Delta Convention Center",
        location: "Chicago",
        capacity: 1000,
        pricePerDay: 5000,
        description: "Delta center description",
      });
  });

  it("should return a bare JSON array containing all venues when no query params are provided", async () => {
    const res = await request(app).get("/api/venues");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(4);
    expect(res.headers).toHaveProperty("x-total-count", "4");
    expect(res.headers).toHaveProperty("access-control-expose-headers");
  });

  it("should filter by q (case-insensitive name or location match)", async () => {
    const resName = await request(app).get("/api/venues?q=beach");
    expect(resName.statusCode).toBe(200);
    expect(Array.isArray(resName.body)).toBe(true);
    expect(resName.body.length).toBe(1);
    expect(resName.body[0].name).toBe("Beta Beach Resort");

    const resLocation = await request(app).get("/api/venues?q=chicago");
    expect(resLocation.statusCode).toBe(200);
    expect(resLocation.body.length).toBe(1);
    expect(resLocation.body[0].name).toBe("Delta Convention Center");
  });

  it("should filter by location, minCapacity, minPrice, maxPrice alone and combined", async () => {
    const resLoc = await request(app).get("/api/venues?location=New%20York");
    expect(resLoc.body.length).toBe(2);

    const resCap = await request(app).get("/api/venues?minCapacity=300");
    expect(resCap.body.length).toBe(2);

    const resPrice = await request(app).get(
      "/api/venues?minPrice=1000&maxPrice=2500"
    );
    expect(resPrice.body.length).toBe(2);

    const resCombined = await request(app).get(
      "/api/venues?location=New%20York&minCapacity=400&minPrice=1500"
    );
    expect(resCombined.body.length).toBe(1);
    expect(resCombined.body[0].name).toBe("Alpha Grand Hall (Center)");
  });

  it("should match regex special characters in q/location literally without crashing", async () => {
    const resSpecial = await request(app).get(
      "/api/venues?q=Special%2BComplex"
    );
    expect(resSpecial.statusCode).toBe(200);
    expect(resSpecial.body.length).toBe(1);
    expect(resSpecial.body[0].name).toContain("Special+Complex");
  });

  it("should sort correctly by price_asc, price_desc, and newest", async () => {
    const resAsc = await request(app).get("/api/venues?sort=price_asc");
    expect(resAsc.body.map((v) => v.pricePerDay)).toEqual([
      800, 1500, 2000, 5000,
    ]);

    const resDesc = await request(app).get("/api/venues?sort=price_desc");
    expect(resDesc.body.map((v) => v.pricePerDay)).toEqual([
      5000, 2000, 1500, 800,
    ]);
  });

  it("should handle pagination (limit, page, total count headers, out of range page, limit > 100 error)", async () => {
    const resPage1 = await request(app).get(
      "/api/venues?limit=2&page=1&sort=price_asc"
    );
    expect(resPage1.statusCode).toBe(200);
    expect(resPage1.body.length).toBe(2);
    expect(resPage1.headers["x-total-count"]).toBe("4");
    expect(resPage1.headers["x-page"]).toBe("1");
    expect(resPage1.headers["x-limit"]).toBe("2");
    expect(resPage1.headers["x-total-pages"]).toBe("2");

    const resPage2 = await request(app).get(
      "/api/venues?limit=2&page=2&sort=price_asc"
    );
    expect(resPage2.body.length).toBe(2);
    expect(resPage2.body[0].pricePerDay).toBe(2000);

    const resPastEnd = await request(app).get("/api/venues?limit=2&page=5");
    expect(resPastEnd.body).toEqual([]);

    const resOverLimit = await request(app).get("/api/venues?limit=101");
    expect(resOverLimit.statusCode).toBe(400);
    expect(resOverLimit.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 400 for minPrice > maxPrice and operator injection attempts", async () => {
    const resInvalidPrice = await request(app).get(
      "/api/venues?minPrice=3000&maxPrice=1000"
    );
    expect(resInvalidPrice.statusCode).toBe(400);
    expect(resInvalidPrice.body.error.code).toBe("VALIDATION_ERROR");

    const resOperator = await request(app).get(
      "/api/venues?location[$ne]=x"
    );
    expect(resOperator.statusCode).toBe(400);
    expect(resOperator.body.error.code).toBe("VALIDATION_ERROR");

    const resRegexOperator = await request(app).get(
      "/api/venues?q[$regex]=.*"
    );
    expect(resRegexOperator.statusCode).toBe(400);
    expect(resRegexOperator.body.error.code).toBe("VALIDATION_ERROR");
  });
});
