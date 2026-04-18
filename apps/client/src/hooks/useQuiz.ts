import { useReducer, useCallback, useEffect } from "react";
import { QuizQuestion, QuizAnswer, QuizResults } from "../dataModel/quizModel";
import { getQuizQuestions, QuizServiceError } from "../services/quizService";

type QuizStatus = "loading" | "active" | "completed" | "error";

interface State {
  status: QuizStatus;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  startTime: number;
  results: QuizResults | null;
  error: string | null;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; questions: QuizQuestion[] }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "SELECT_ANSWER"; questionId: string; optionId: string }
  | { type: "ADVANCE" };

const initialState: State = {
  status: "loading",
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: Date.now(),
  results: null,
  error: null,
};

function computeResults(
  questions: QuizQuestion[],
  answers: Record<string, string>,
  startTime: number,
): QuizResults {
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  const answerDetails: QuizAnswer[] = questions.map((q) => {
    const userAnswerId = answers[q.id];
    const userOption = q.options.find((o) => o.id === userAnswerId);
    const correctOption = q.options.find((o) => o.id === q.correctAnswer);
    return {
      questionId: q.id,
      question: q.question,
      userAnswer: userOption?.text ?? "Not answered",
      correctAnswer: correctOption?.text ?? "",
      isCorrect: userAnswerId === q.correctAnswer,
      explanation: q.explanation,
    };
  });

  const correctAnswers = answerDetails.filter((a) => a.isCorrect).length;
  return {
    totalQuestions: questions.length,
    correctAnswers,
    score: Math.round((correctAnswers / questions.length) * 100),
    timeSpent,
    answers: answerDetails,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...initialState, startTime: Date.now() };
    case "LOAD_SUCCESS":
      return {
        ...initialState,
        status: "active",
        questions: action.questions,
        startTime: Date.now(),
      };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.error };
    case "SELECT_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId },
      };
    case "ADVANCE": {
      const isLast = state.currentIndex === state.questions.length - 1;
      if (isLast) {
        return {
          ...state,
          status: "completed",
          results: computeResults(state.questions, state.answers, state.startTime),
        };
      }
      return { ...state, currentIndex: state.currentIndex + 1 };
    }
    default:
      return state;
  }
}

export const useQuiz = (topic?: string) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const currentQuestion = state.questions[state.currentIndex];
  const selectedAnswer = state.answers[currentQuestion?.id];

  const loadQuestions = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const questions = await getQuizQuestions({ topic });
      dispatch({ type: "LOAD_SUCCESS", questions });
    } catch (err) {
      dispatch({
        type: "LOAD_ERROR",
        error:
          err instanceof QuizServiceError
            ? err.message
            : "Failed to load quiz questions",
      });
    }
  }, [topic]);

  const handleOptionSelect = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      dispatch({ type: "SELECT_ANSWER", questionId: currentQuestion.id, optionId });
      setTimeout(() => dispatch({ type: "ADVANCE" }), 800);
    },
    [currentQuestion],
  );

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    status: state.status,
    questions: state.questions,
    currentQuestion,
    selectedAnswer,
    results: state.results,
    error: state.error,
    currentQuestionNumber: state.currentIndex + 1,
    handleOptionSelect,
    onRestart: loadQuestions,
  };
};
