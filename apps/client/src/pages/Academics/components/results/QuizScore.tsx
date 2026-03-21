import { QUIZ_CONFIG } from "../../../../constants/quiz";

interface QuizScoreProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

export const QuizScore = ({
  score,
  correctAnswers,
  totalQuestions,
}: QuizScoreProps) => {
  const scoreColor =
    score >= QUIZ_CONFIG.GOOD_SCORE
      ? "text-brand-green"
      : score >= QUIZ_CONFIG.PASSING_SCORE
        ? "text-link"
        : "text-danger-red";

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">
        Quiz Complete!
      </h1>
      <p className={`text-5xl font-bold mb-2 ${scoreColor}`}>{score}%</p>
      <p className="text-lg text-very-dark-grey">
        You got {correctAnswers} out of {totalQuestions} questions correct
      </p>
    </div>
  );
};
