import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Home } from "./Home";

describe("Home", () => {
  it("renders the integrations section heading", () => {
    render(<Home />);
    expect(screen.getByText("Works With Everything")).toBeInTheDocument();
  });

  it("renders integration pill labels", () => {
    render(<Home />);
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("renders extension card names", () => {
    render(<Home />);
    expect(screen.getByText("signal-check")).toBeInTheDocument();
    expect(screen.getByText("context7")).toBeInTheDocument();
  });
});
