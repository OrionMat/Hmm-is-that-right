import { QuizResults } from "../../../dataModel/quizModel";
import { QuizScore } from "./results/QuizScore";
import { QuizStats } from "./results/QuizStats";
import { AnswerReview } from "./results/AnswerReview";

interface ResultsScreenProps {
  results: QuizResults;
  onRestart: () => void;
}

export const ResultsScreen = ({ results, onRestart }: ResultsScreenProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-light-grey p-8 w-full max-w-2xl mx-auto">
      <QuizScore
        score={results.score}
        correctAnswers={results.correctAnswers}
        totalQuestions={results.totalQuestions}
      />

      <QuizStats
        totalQuestions={results.totalQuestions}
        correctAnswers={results.correctAnswers}
        timeSpent={results.timeSpent}
      />

      <AnswerReview answers={results.answers} />

      <button
        onClick={onRestart}
        className="block mx-auto mt-8 px-8 py-3 rounded-lg bg-link text-white font-medium text-base cursor-pointer transition-opacity duration-200 hover:opacity-80"
      >
        Start New Quiz
      </button>
    </div>
  );
};
