import React from "react";
import { QuizCard } from "../components/QuizCard";
import { Question } from "../components/Question";
import { Options } from "../components/Options";
import { ProgressBar } from "../components/ProgressBar";
import { NavigationButtons } from "../components/NavigationButtons";
import { ResultsScreen } from "../components/ResultsScreen";
import { PageContainer } from "../components/PageContainer";
import { useQuiz } from "../hooks/useQuiz";

export const MentalGym = () => {
  const {
    questions,
    quizState,
    quizResults,
    isLoading,
    error,
    currentQuestion,
    selectedAnswer,
    handleOptionSelect,
    handleNext,
    handleRestart,
  } = useQuiz();

  // Show error state
  if (error) {
    return (
      <PageContainer id="content">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleRestart} style={{ marginTop: "1rem" }}>
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <PageContainer id="content">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading quiz...
        </div>
      </PageContainer>
    );
  }

  // If quiz is completed, show results
  if (quizState.isCompleted && quizResults) {
    return (
      <PageContainer id="content">
        <ResultsScreen results={quizResults} onRestart={handleRestart} />
      </PageContainer>
    );
  }

  // Show current question
  return (
    <PageContainer id="content">
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
        current={quizState.currentQuestionIndex + 1}
        total={questions.length}
      />

      <NavigationButtons
        onNext={handleNext}
        canGoNext={false} // Disable Next button since we auto-advance
        nextLabel="Next"
        showNext={false} // Hide Next button completely
      />
    </PageContainer>
  );
};
