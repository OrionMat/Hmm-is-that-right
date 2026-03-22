import { QuizCard } from "./components/QuizCard";
import { Question } from "./components/Question";
import { Options } from "./components/Options";
import { ProgressBar } from "./components/ProgressBar";
import { ResultsScreen } from "./components/ResultsScreen";
import { PageContainer } from "../../components/PageContainer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useQuiz } from "../../hooks/useQuiz";

export const Academics = () => {
  const {
    status,
    questions,
    currentQuestion,
    selectedAnswer,
    results,
    error,
    currentQuestionNumber,
    handleOptionSelect,
    onRestart,
  } = useQuiz();

  if (status === "error") {
    return (
      <PageContainer>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-very-dark-grey mb-4">{error}</p>
          <button
            onClick={onRestart}
            className="px-6 py-2 rounded-lg bg-link text-white font-medium hover:opacity-80 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  if (status === "loading") {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (status === "completed" && results) {
    return (
      <PageContainer>
        <ResultsScreen results={results} onRestart={onRestart} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <QuizCard>
        <Question text={currentQuestion.question} />
        <Options
          options={currentQuestion.options}
          selectedOptionId={selectedAnswer}
          correctAnswerId={currentQuestion.correctAnswer}
          showFeedback={!!selectedAnswer}
          onOptionSelect={handleOptionSelect}
        />
      </QuizCard>

      <ProgressBar
        current={currentQuestionNumber}
        total={questions.length}
      />
    </PageContainer>
  );
};
