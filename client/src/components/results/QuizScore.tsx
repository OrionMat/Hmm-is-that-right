import React from "react";
import styled from "styled-components";
import { fonts } from "../../styles/fonts";
import { QUIZ_CONFIG } from "../../constants/quiz";

const ResultsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ResultsTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
  font-family: ${fonts.primary};
`;

const ScoreDisplay = styled.div<{ $score: number }>`
  font-size: 3rem;
  font-weight: bold;
  color: ${(props) =>
    props.$score >= QUIZ_CONFIG.GOOD_SCORE
      ? QUIZ_CONFIG.COLORS.CORRECT
      : props.$score >= QUIZ_CONFIG.PASSING_SCORE
        ? QUIZ_CONFIG.COLORS.PRIMARY
        : QUIZ_CONFIG.COLORS.INCORRECT};
  margin-bottom: 0.5rem;
  font-family: ${fonts.primary};
`;

const ScoreText = styled.div`
  font-size: 1.25rem;
  color: ${QUIZ_CONFIG.COLORS.GREY};
  margin-bottom: 2rem;
  font-family: ${fonts.primary};
`;

interface QuizScoreProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

export const QuizScore: React.FC<QuizScoreProps> = ({
  score,
  correctAnswers,
  totalQuestions,
}) => {
  return (
    <ResultsHeader>
      <ResultsTitle>Quiz Complete!</ResultsTitle>
      <ScoreDisplay $score={score}>{score}%</ScoreDisplay>
      <ScoreText>
        You got {correctAnswers} out of {totalQuestions} questions correct
      </ScoreText>
    </ResultsHeader>
  );
};
