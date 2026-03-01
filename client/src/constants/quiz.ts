export const QUIZ_CONFIG = {
  PASSING_SCORE: 60,
  GOOD_SCORE: 80,
  COLORS: {
    CORRECT: '#28a745',
    INCORRECT: '#d42828',
    PRIMARY: '#4285f4',
    GREY: '#666',
    LIGHT_GREY: '#e0e0e0',
    BACKGROUND_GREY: '#f5f5f5'
  }
} as const;

export const QUIZ_MESSAGES = {
  COMPLETE: 'Quiz Complete!',
  RESTART: 'Start New Quiz',
  REVIEW_ANSWERS: 'Review Your Answers'
} as const;
