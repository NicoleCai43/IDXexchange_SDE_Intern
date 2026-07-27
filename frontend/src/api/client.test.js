import { describe, expect, it, vi, beforeEach } from "vitest";
import { fetchProperties, fetchPropertyDetail } from "./client.js";

describe("api/client", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("omits empty filter values when building the API query", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    });

    await fetchProperties({ city: "Austin", zip: "", minPrice: "100000" });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain("/api/properties?");
    expect(global.fetch.mock.calls[0][0]).toContain("city=Austin");
    expect(global.fetch.mock.calls[0][0]).toContain("minPrice=100000");
    expect(global.fetch.mock.calls[0][0]).not.toContain("zip=");
  });

  it("throws a helpful error message when the API response is not ok", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: "Bad request" }),
    });

    await expect(fetchProperties({})).rejects.toThrow("Bad request");
  });

  it("encodes property ids in fetchPropertyDetail and returns parsed JSON", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: "A B/C" }),
    });

    const result = await fetchPropertyDetail("A B/C");

    expect(global.fetch).toHaveBeenCalledWith("/api/properties/A%20B%2FC");
    expect(result).toEqual({ id: "A B/C" });
  });
});
