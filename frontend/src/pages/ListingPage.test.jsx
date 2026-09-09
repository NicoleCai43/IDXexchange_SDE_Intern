import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ListingPage from "./ListingPage.jsx";
import { fetchProperties } from "../api/client.js";

vi.mock("../api/client.js", () => ({
  fetchProperties: vi.fn(),
}));

function makeProperty(id) {
  return {
    L_ListingID: String(id),
    L_Address: `${id} Main St`,
    L_City: "Austin",
    L_State: "TX",
    L_SystemPrice: 250000,
    L_Keyword2: 3,
    LM_Dec_3: 2,
    LM_Int2_3: 1800,
    L_Photos: "[]",
  };
}

function renderListing() {
  return render(
    <MemoryRouter>
      <ListingPage />
    </MemoryRouter>
  );
}

describe("ListingPage", () => {
  beforeEach(() => {
    fetchProperties.mockReset();
    fetchProperties.mockResolvedValue({
      results: [makeProperty(1)],
      total: 41,
    });
  });

  it("loads and displays properties with pagination", async () => {
    renderListing();

    expect(await screen.findByText("1 Main St")).toBeInTheDocument();
    expect(screen.getByText("Showing 1-1 of 41 properties")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(fetchProperties).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, offset: 0, sortOrder: "asc" })
    );
  });

  it("submits filters and resets to the first page", async () => {
    const user = userEvent.setup();
    renderListing();
    await screen.findByText("1 Main St");

    await user.type(screen.getByLabelText(/City/i), "Portland");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(fetchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({ city: "Portland", limit: 20, offset: 0 })
      );
    });
  });

  it("changes sort field, sort direction, and page", async () => {
    const user = userEvent.setup();
    renderListing();
    await screen.findByText("1 Main St");

    await user.selectOptions(screen.getByLabelText(/Sort by/i), "L_SystemPrice");
    await user.click(screen.getByRole("button", { name: "Asc" }));
    await user.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(fetchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: "L_SystemPrice",
          sortOrder: "desc",
          offset: 20,
        })
      );
    });
  });
});
