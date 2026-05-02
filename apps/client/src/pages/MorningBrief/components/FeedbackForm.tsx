import { FormEvent, useState } from "react";
import { submitFeedback } from "../../../service/submitFeedback";

type Status = "idle" | "submitting" | "success" | "error";

export const FeedbackForm = () => {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setStatus("submitting");
    try {
      await submitFeedback(text);
      setText("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl flex flex-col gap-3"
      aria-label="Feedback form"
    >
      <label htmlFor="feedback-input" className="font-mono text-sm font-bold">
        Feedback on this brief
      </label>
      <textarea
        id="feedback-input"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={status === "submitting"}
        placeholder="What worked? What didn't? What should change?"
        className="w-full border border-light-grey rounded-lg p-3 font-mono text-sm resize-none transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_1px_6px_var(--color-dark-grey)] focus:border-transparent disabled:opacity-40"
      />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={!text.trim() || status === "submitting"}
          className="h-[36px] px-6 border border-light-grey rounded-full font-mono text-sm bg-transparent cursor-pointer transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_1px_6px_var(--color-dark-grey)] focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Sending…" : "Submit"}
        </button>
        {status === "success" && (
          <p className="font-mono text-sm text-green-600">Thanks for the feedback!</p>
        )}
        {status === "error" && (
          <p className="font-mono text-sm text-red-500">Failed to send — please try again.</p>
        )}
      </div>
    </form>
  );
};
