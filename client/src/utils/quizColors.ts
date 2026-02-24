import { QUIZ_CONFIG } from '../constants/quiz';

export const getOptionBorderColor = (
  isSelected: boolean,
  isCorrect?: boolean,
  showFeedback?: boolean
): string => {
  if (showFeedback && isCorrect) return QUIZ_CONFIG.COLORS.CORRECT;
  if (showFeedback && !isCorrect && isSelected) return QUIZ_CONFIG.COLORS.INCORRECT;
  return isSelected ? QUIZ_CONFIG.COLORS.PRIMARY : QUIZ_CONFIG.COLORS.LIGHT_GREY;
};

export const getOptionBackgroundColor = (
  isSelected: boolean,
  isCorrect?: boolean,
  showFeedback?: boolean
): string => {
  if (showFeedback && isCorrect) return `${QUIZ_CONFIG.COLORS.CORRECT}10`;
  if (showFeedback && !isCorrect && isSelected) return `${QUIZ_CONFIG.COLORS.INCORRECT}10`;
  return isSelected ? `${QUIZ_CONFIG.COLORS.PRIMARY}10` : 'white';
};

export const getOptionHoverBackgroundColor = (
  isSelected: boolean,
  isCorrect?: boolean,
  showFeedback?: boolean
): string => {
  if (showFeedback && isCorrect) return `${QUIZ_CONFIG.COLORS.CORRECT}20`;
  if (showFeedback && !isCorrect && isSelected) return `${QUIZ_CONFIG.COLORS.INCORRECT}20`;
  return isSelected ? `${QUIZ_CONFIG.COLORS.PRIMARY}10` : `${QUIZ_CONFIG.COLORS.PRIMARY}05`;
};

export const getOptionCircleColor = (
  isSelected: boolean,
  isCorrect?: boolean,
  showFeedback?: boolean
): string => {
  if (showFeedback && isCorrect) return QUIZ_CONFIG.COLORS.CORRECT;
  if (showFeedback && !isCorrect && isSelected) return QUIZ_CONFIG.COLORS.INCORRECT;
  return isSelected ? QUIZ_CONFIG.COLORS.PRIMARY : 'white';
};
