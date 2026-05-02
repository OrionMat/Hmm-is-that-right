import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeedbackForm } from "./FeedbackForm";
import * as service from "../../../service/submitFeedback";

vi.mock("../../../service/submitFeedback");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FeedbackForm", () => {
  it("renders textarea and a disabled submit button when empty", () => {
    render(<FeedbackForm />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("enables the submit button once text is entered", () => {
    render(<FeedbackForm />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Great brief!" } });
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
  });

  it("calls submitFeedback with the text and shows success message", async () => {
    vi.mocked(service.submitFeedback).mockResolvedValue(undefined);

    render(<FeedbackForm />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Loved the tech section" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/thanks for the feedback/i)).toBeInTheDocument();
    });

    expect(service.submitFeedback).toHaveBeenCalledOnce();
    expect(service.submitFeedback).toHaveBeenCalledWith("Loved the tech section");
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("shows an error message when the service rejects", async () => {
    vi.mocked(service.submitFeedback).mockRejectedValue(new Error("network error"));

    render(<FeedbackForm />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Some feedback" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("textbox")).toHaveValue("Some feedback");
  });

  it("does not submit when text is only whitespace", () => {
    vi.mocked(service.submitFeedback).mockResolvedValue(undefined);

    render(<FeedbackForm />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "   " } });
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });
});
