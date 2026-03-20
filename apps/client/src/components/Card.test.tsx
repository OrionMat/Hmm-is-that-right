import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "./Card";
import { CardData } from "../dataModel/dataModel";

const baseCard: CardData = {
  name: "test-card",
  handle: "@test/card",
  description: "A test card description.",
  kinds: ["MCP", "Skills"],
  score: 1234,
  badge: "TC",
};

describe("Card", () => {
  it("renders name, handle, and description", () => {
    render(<Card card={baseCard} />);
    expect(screen.getByText("test-card")).toBeInTheDocument();
    expect(screen.getByText("@test/card")).toBeInTheDocument();
    expect(screen.getByText("A test card description.")).toBeInTheDocument();
  });

  it("renders the badge", () => {
    render(<Card card={baseCard} />);
    expect(screen.getByText("TC")).toBeInTheDocument();
  });

  it("renders the score with star icon", () => {
    render(<Card card={baseCard} />);
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("renders kind tags", () => {
    render(<Card card={baseCard} />);
    expect(screen.getByText("MCP")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });
});
