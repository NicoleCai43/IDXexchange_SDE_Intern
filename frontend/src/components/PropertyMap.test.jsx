import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PropertyMap from "./PropertyMap.jsx";

describe("PropertyMap", () => {
  it("does not render when coordinates are missing or invalid", () => {
    const { container } = render(<PropertyMap lat={null} lng={-122.67} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders valid zero coordinates", () => {
    render(<PropertyMap lat={0} lng={0} label="Equator" />);

    expect(screen.getByTitle("Equator")).toHaveAttribute("src", expect.stringContaining("0%2C0"));
  });
});