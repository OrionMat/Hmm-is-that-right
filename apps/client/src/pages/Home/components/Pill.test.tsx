import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Pill } from "./Pill";

describe("Pill", () => {
  it("renders the label", () => {
    render(<Pill label="WhatsApp" />);
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
  });

  it("renders the icon when provided", () => {
    const MockIcon = vi.fn(() => <svg data-testid="mock-icon" />);
    render(<Pill label="Test" icon={MockIcon} />);
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    expect(MockIcon).toHaveBeenCalled();
  });

  it("renders without an icon", () => {
    render(<Pill label="No Icon" />);
    expect(screen.getByText("No Icon")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
