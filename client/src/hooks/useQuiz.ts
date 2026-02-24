import { useState, useCallback, useEffect, useRef } from "react";
import { QuizQuestion, QuizState, QuizResults } from "../dataModel/quizModel";
import {
  getQuizQuestions,
  calculateQuizResults,
  QuizServiceError,
} from "../services/quizService";

export const useQuiz = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isCompleted: false,
    startTime: new Date(),
  });
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitializing = useRef(false); // Prevent duplicate initialization

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const selectedAnswer = quizState.answers[currentQuestion?.id];

  const initializeQuiz = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isInitializing.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    isInitializing.current = true;

    try {
      const quizQuestions = await getQuizQuestions();
      setQuestions(quizQuestions);
      setQuizState({
        currentQuestionIndex: 0,
        answers: {},
        isCompleted: false,
        startTime: new Date(),
      });
      setQuizResults(null);
    } catch (err) {
      if (err instanceof QuizServiceError) {
        setError(err.message);
      } else {
        setError("Failed to load quiz questions");
      }
    } finally {
      setIsLoading(false);
      isInitializing.current = false;
    }
  }, []);

  const handleNext = useCallback(() => {
    setQuizState((currentState) => {
      if (currentState.currentQuestionIndex < questions.length - 1) {
        // Go to next question
        return {
          ...currentState,
          currentQuestionIndex: currentState.currentQuestionIndex + 1,
        };
      } else {
        // Complete quiz - use current state to get latest answers
        const endTime = new Date();
        const results = calculateQuizResults(
          questions,
          currentState.answers, // Use current state answers
          currentState.startTime,
          endTime,
        );
        setQuizResults(results);
        return {
          ...currentState,
          isCompleted: true,
          endTime,
        };
      }
    });
  }, [questions]);

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      setQuizState((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestion.id]: optionId,
        },
      }));

      // Auto-advance to next question after selection
      setTimeout(() => {
        handleNext();
      }, 800); // Brief delay to show feedback before advancing
    },
    [currentQuestion?.id, handleNext],
  );

  const handleRestart = useCallback(() => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
      startTime: new Date(),
    });
    setQuizResults(null);
  }, []);

  const canGoNext = !!selectedAnswer;
  const progress =
    questions.length > 0
      ? ((quizState.currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  // Initialize quiz on mount
  useEffect(() => {
    initializeQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    questions,
    quizState,
    quizResults,
    isLoading,
    error,
    currentQuestion,
    selectedAnswer,

    // Computed values
    canGoNext,
    progress,

    // Actions
    initializeQuiz,
    handleOptionSelect,
    handleNext,
    handleRestart,
  };
};
