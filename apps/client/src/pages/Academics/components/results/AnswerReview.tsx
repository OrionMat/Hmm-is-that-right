import { QuizAnswer } from "../../../../dataModel/quizModel";

interface AnswerReviewProps {
  answers: QuizAnswer[];
}

export const AnswerReview = ({ answers }: AnswerReviewProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Review Your Answers
      </h2>
      {answers.map((answer, index) => (
        <div
          key={answer.questionId}
          className={`p-4 mb-4 rounded-lg border-l-4 ${
            answer.isCorrect
              ? "border-brand-green bg-green-50"
              : "border-danger-red bg-red-50"
          }`}
        >
          <p className="font-semibold text-gray-800 mb-3">
            {answer.isCorrect ? "✓" : "✗"} Question {index + 1}:{" "}
            {answer.question}
          </p>
          <div className="text-sm text-very-dark-grey leading-relaxed space-y-1">
            <p>
              <strong>Your answer:</strong> {answer.userAnswer}
            </p>
            {!answer.isCorrect && (
              <p>
                <strong>Correct answer:</strong> {answer.correctAnswer}
              </p>
            )}
            {answer.explanation && (
              <p>
                <strong>Explanation:</strong> {answer.explanation}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
