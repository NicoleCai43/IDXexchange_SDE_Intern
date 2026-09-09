import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ErrorBoundary from "./ErrorBoundary.jsx";

function BrokenComponent() {
  throw new Error("render failed");
}

describe("ErrorBoundary", () => {
  it("renders a recovery message when a child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
