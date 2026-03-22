import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FactCheck } from "./FactCheck";
import { getNewsPieces } from "../../service/getNewsPieces";

vi.mock("../../service/getNewsPieces");

describe("FactCheck", () => {
  it("shows a loading spinner while fetching and removes it when done", async () => {
    let resolve: (val: unknown) => void;
    const deferred = new Promise((r) => {
      resolve = r;
    });
    vi.mocked(getNewsPieces).mockReturnValue(deferred as never);

    render(<FactCheck />);

    const input = screen.getByPlaceholderText("Check a fact or statement");
    fireEvent.change(input, { target: { value: "test statement" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByRole("status")).toBeInTheDocument();

    resolve!([]);

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("renders results after a successful fetch", async () => {
    vi.mocked(getNewsPieces).mockResolvedValue([
      {
        url: "https://example.com",
        title: "Test Article",
        date: "2024-01-01",
        body: ["Some body text"],
        source: "bbc",
      },
    ] as never);

    render(<FactCheck />);

    const input = screen.getByPlaceholderText("Check a fact or statement");
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Test Article")).toBeInTheDocument();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
