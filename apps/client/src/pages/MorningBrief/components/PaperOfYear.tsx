import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PaperOfYear as PaperOfYearType, ConversationTurn } from "../../../dataModel/dataModel";
import { streamPaperQa } from "../../../service/paperOfYearService";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

interface PaperOfYearProps {
  paper: PaperOfYearType;
}

export const PaperOfYear = ({ paper }: PaperOfYearProps) => {
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef("");

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleAsk = () => {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const questionSnapshot = trimmed;
    const historySnapshot = history;

    setHistory((prev) => [...prev, { role: "user", content: questionSnapshot }]);
    setQuestion("");
    setQaError(null);
    setStreamingAnswer("");
    setIsStreaming(true);
    answerRef.current = "";

    streamPaperQa(
      paper.arxivId,
      questionSnapshot,
      historySnapshot,
      {
        onChunk: (delta) => {
          answerRef.current += delta;
          setStreamingAnswer(answerRef.current);
        },
        onDone: () => {
          setHistory((prev) => [...prev, { role: "assistant", content: answerRef.current }]);
          answerRef.current = "";
          setStreamingAnswer("");
          setIsStreaming(false);
        },
        onError: (message) => {
          setQaError(message);
          setIsStreaming(false);
        },
      },
      abortRef.current.signal,
    );
  };

  const authorStr =
    paper.authors.length <= 3
      ? paper.authors.join(", ")
      : `${paper.authors.slice(0, 3).join(", ")} et al.`;

  return (
    <div className="w-full max-w-2xl border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-mono font-bold text-base">Paper of the Week</h2>
        <a
          href={`https://arxiv.org/abs/${paper.arxivId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono font-semibold text-sm text-blue-600 hover:underline leading-snug"
        >
          {paper.title}
        </a>
        <span className="font-mono text-xs text-gray-400">
          {authorStr} · {paper.year} · {paper.citationCount.toLocaleString()} citations
        </span>
      </div>

      <p className="font-mono text-sm text-gray-600 italic">{paper.whyInteresting}</p>

      <div className="border-t border-gray-100 pt-4">
        <p className="font-mono text-xs uppercase tracking-wide text-gray-400 mb-2">Abstract</p>
        <p className="font-mono text-sm text-gray-700 leading-relaxed">{paper.abstract}</p>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
          {history.map((turn, i) =>
            turn.role === "user" ? (
              <div key={i} className="flex flex-col gap-1">
                <span className="font-mono text-xs font-semibold text-gray-500">You</span>
                <p className="font-mono text-sm text-gray-700">{turn.content}</p>
              </div>
            ) : (
              <div key={i} className="flex flex-col gap-1">
                <span className="font-mono text-xs font-semibold text-gray-500">Claude</span>
                <div className="font-mono text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown>{turn.content}</ReactMarkdown>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {isStreaming && (
        <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
          <span className="font-mono text-xs font-semibold text-gray-500">Claude</span>
          {streamingAnswer ? (
            <div className="font-mono text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{streamingAnswer}</ReactMarkdown>
            </div>
          ) : (
            <LoadingSpinner className="w-4 h-4 border-[1.5px]" />
          )}
        </div>
      )}

      {qaError && (
        <p className="font-mono text-sm text-red-500">{qaError}</p>
      )}

      <div className="flex gap-2 border-t border-gray-100 pt-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder="Ask a question about this paper…"
          disabled={isStreaming}
          className="flex-1 h-[36px] px-3 border border-gray-200 rounded font-mono text-sm bg-transparent focus:outline-none focus:border-gray-400 disabled:opacity-40"
        />
        <button
          onClick={handleAsk}
          disabled={isStreaming || !question.trim()}
          className="h-[36px] px-4 border border-light-grey rounded font-mono text-sm bg-transparent cursor-pointer transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_1px_6px_var(--color-dark-grey)] focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isStreaming ? "…" : "Ask"}
        </button>
      </div>
    </div>
  );
};
