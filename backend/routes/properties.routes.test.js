const assert = require("node:assert/strict");
const test = require("node:test");
const express = require("express");
const request = require("supertest");
const { createPropertiesRouter } = require("./properties");

function createTestApp(queryHandler) {
  const app = express();
  const database = { query: queryHandler };
  app.use("/api/properties", createPropertiesRouter(database));
  return app;
}

function property(listingId = "123") {
  return {
    L_ListingID: listingId,
    L_Address: "123 Main St",
    L_City: "Portland",
    L_SystemPrice: 350000,
    L_Keyword2: 3,
    LM_Dec_3: 2,
    LM_Int2_3: 1800,
  };
}

test("GET /api/properties returns filtered and sorted results", async () => {
  const app = createTestApp(async (sql, values) => {
    if (sql.includes("COUNT(*)")) {
      assert.match(sql, /LOWER\(L_City\) = LOWER\(\?\)/);
      assert.deepEqual(values, ["PORTLAND", 200000]);
      return [[{ total: 1 }]];
    }

    assert.match(sql, /ORDER BY L_SystemPrice DESC/);
    assert.deepEqual(values, ["PORTLAND", 200000, 20, 0]);
    return [[property()]];
  });

  const response = await request(app)
    .get("/api/properties")
    .query({ city: "PORTLAND", minPrice: 200000, sortBy: "L_SystemPrice", sortOrder: "desc" });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.results, [property()]);
  assert.equal(response.body.total, 1);
});

test("GET /api/properties rejects invalid input before querying", async () => {
  let queryCalled = false;
  const app = createTestApp(async () => {
    queryCalled = true;
    return [[]];
  });

  const response = await request(app)
    .get("/api/properties")
    .query({ sortBy: "L_Address;DROP TABLE rets_property" });

  assert.equal(response.status, 400);
  assert.equal(queryCalled, false);
  assert.equal(response.body.error, "Invalid query parameters");
});

test("GET /api/properties/:id returns a property", async () => {
  const app = createTestApp(async (sql, values) => {
    assert.match(sql, /L_ListingID = \?/);
    assert.deepEqual(values, ["123"]);
    return [[property()]];
  });

  const response = await request(app).get("/api/properties/123");

  assert.equal(response.status, 200);
  assert.equal(response.body.L_Address, "123 Main St");
});

test("GET /api/properties/:id returns 404 for an unknown property", async () => {
  const app = createTestApp(async () => [[]]);
  const response = await request(app).get("/api/properties/999");

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "Property not found");
});

test("GET /api/properties/:id/openhouses returns open houses", async () => {
  const openHouse = {
    L_ListingID: "123",
    OpenHouseDate: "2026-09-15",
    OH_StartTime: "10:00 AM",
    OH_EndTime: "2:00 PM",
    all_data: JSON.stringify({ OpenHouseRemarks: "By appointment" }),
  };
  const app = createTestApp(async (sql) => {
    if (sql.includes("rets_openhouse")) return [[openHouse]];
    return [[property()]];
  });

  const response = await request(app).get("/api/properties/123/openhouses");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, [openHouse]);
});

test("GET /api/properties/:id/openhouses returns 404 for an unknown property", async () => {
  const app = createTestApp(async () => [[]]);
  const response = await request(app).get("/api/properties/999/openhouses");

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "Property not found");
});

test("property routes return 500 when the database fails", async () => {
  const app = createTestApp(async () => {
    throw new Error("database unavailable");
  });

  const response = await request(app).get("/api/properties/123");

  assert.equal(response.status, 500);
  assert.equal(response.body.error, "Failed to fetch property");
});
