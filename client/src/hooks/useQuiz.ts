import { useState, useCallback, useEffect, useRef } from "react";
import { QuizQuestion, QuizState, QuizResults } from "../dataModel/quizModel";
import {
  getQuizQuestions,
  submitQuizAnswers,
  QuizServiceError,
} from "../services/quizService";

interface InternalQuizState {
  questions: QuizQuestion[];
  quizState: QuizState;
  quizResults: QuizResults | null;
  isLoading: boolean;
  error: string | null;
}

export const useQuiz = (topic?: string) => {
  const [state, setState] = useState<InternalQuizState>({
    questions: [],
    quizState: {
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
      startTime: new Date(),
    },
    quizResults: null,
    isLoading: true,
    error: null,
  });

  const isInitializing = useRef(false);

  const currentQuestion = state.questions[state.quizState.currentQuestionIndex];
  const selectedAnswer = state.quizState.answers[currentQuestion?.id];

  const initializeQuiz = useCallback(async () => {
    if (isInitializing.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    isInitializing.current = true;

    try {
      const quizQuestions = await getQuizQuestions({ topic });
      setState(prev => ({
        ...prev,
        questions: quizQuestions,
        quizState: {
          currentQuestionIndex: 0,
          answers: {},
          isCompleted: false,
          startTime: new Date(),
        },
        quizResults: null,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof QuizServiceError ? err.message : "Failed to load quiz questions"
      }));
    } finally {
      isInitializing.current = false;
    }
  }, [topic]);

  const handleNext = useCallback(async (latestAnswers?: Record<string, string>) => {
    setState(prev => {
      const isLastQuestion = prev.quizState.currentQuestionIndex === prev.questions.length - 1;
      const currentAnswers = latestAnswers || prev.quizState.answers;

      if (!isLastQuestion) {
        return {
          ...prev,
          quizState: {
            ...prev.quizState,
            currentQuestionIndex: prev.quizState.currentQuestionIndex + 1,
            answers: currentAnswers
          }
        };
      } else {
        // We handle the completion logic outside of this setState to avoid side effects in the reducer-like pattern
        return prev;
      }
    });

    // Check if it was the last question to trigger the API call
    const isLast = state.quizState.currentQuestionIndex === state.questions.length - 1;
    if (isLast) {
      setState(prev => ({ ...prev, isLoading: true }));
      const endTime = new Date();
      try {
        const results = await submitQuizAnswers(
          state.questions,
          latestAnswers || state.quizState.answers,
          state.quizState.startTime,
          endTime
        );
        setState(prev => ({
          ...prev,
          quizResults: results,
          quizState: { ...prev.quizState, isCompleted: true, endTime, answers: latestAnswers || prev.quizState.answers },
          isLoading: false,
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to calculate results. Please try again."
        }));
      }
    }
  }, [state.questions, state.quizState.currentQuestionIndex, state.quizState.answers, state.quizState.startTime]);

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      const newAnswers = {
        ...state.quizState.answers,
        [currentQuestion.id]: optionId,
      };

      setState(prev => ({
        ...prev,
        quizState: {
          ...prev.quizState,
          answers: newAnswers,
        }
      }));

      // Auto-advance with the NEW answers
      setTimeout(() => {
        handleNext(newAnswers);
      }, 800);
    },
    [currentQuestion?.id, handleNext, state.quizState.answers],
  );

  const handleRestart = useCallback(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  useEffect(() => {
    initializeQuiz();
  }, []);

  return {
    ...state,
    currentQuestion,
    selectedAnswer,
    canGoNext: !!selectedAnswer,
    progress: state.questions.length > 0
      ? ((state.quizState.currentQuestionIndex + 1) / state.questions.length) * 100
      : 0,
    initializeQuiz,
    handleOptionSelect,
    handleNext,
    handleRestart,
  };
};
