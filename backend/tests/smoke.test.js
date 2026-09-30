const request = require("supertest");
const app = require("../app");

describe("Smoke Tests", () => {
  it("GET / should return 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });

  it("GET /unknown-route should return 404 in JSON error format", async () => {
    const res = await request(app).get("/api/non-existent-route-xyz");
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  });
});
