import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyFilters from "./PropertyFilters.jsx";

describe("PropertyFilters", () => {
  it("renders all six filter inputs and action buttons", () => {
    render(<PropertyFilters initialFilters={{}} onSearch={vi.fn()} onClear={vi.fn()} />);

    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ZIP code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Min price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Beds/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Baths/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });

  it("calls onSearch with only non-empty values when submitting the form", async () => {
    const onSearch = vi.fn();
    render(<PropertyFilters initialFilters={{}} onSearch={onSearch} onClear={vi.fn()} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/City/i), "Austin");
    await user.type(screen.getByLabelText(/Min price/i), "250000");
    await user.selectOptions(screen.getByLabelText(/Beds/i), "3");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith({ city: "Austin", minPrice: "250000", beds: "3" });
  });

  it("resets the form and calls onClear when the clear button is clicked", async () => {
    const onClear = vi.fn();
    render(<PropertyFilters initialFilters={{ city: "Austin", zip: "78701" }} onSearch={vi.fn()} onClear={onClear} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(screen.getByLabelText(/City/i)).toHaveValue("");
    expect(screen.getByLabelText(/ZIP code/i)).toHaveValue("");
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
