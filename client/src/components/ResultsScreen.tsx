import React from "react";
import styled from "styled-components";
import { fonts } from "../styles/fonts";
import { QuizResults } from "../dataModel/quizModel";
import { QUIZ_CONFIG } from "../constants/quiz";
import { QuizScore } from "./results/QuizScore";
import { QuizStats } from "./results/QuizStats";
import { AnswerReview } from "./results/AnswerReview";

const ResultsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;

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
  color: #666;
  margin-bottom: 2rem;
  font-family: ${fonts.primary};
`;

const ResultsStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: ${QUIZ_CONFIG.COLORS.BACKGROUND_GREY};
  border: 1px solid ${QUIZ_CONFIG.COLORS.LIGHT_GREY};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  font-family: ${fonts.primary};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
  font-family: ${fonts.primary};
`;

const AnswersSection = styled.div`
  margin-top: 2rem;
`;

const AnswersTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-family: ${fonts.primary};
`;

const AnswerItem = styled.div<{ isCorrect: boolean }>`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border-left: 4px solid
    ${(props) =>
      props.isCorrect
        ? QUIZ_CONFIG.COLORS.CORRECT
        : QUIZ_CONFIG.COLORS.INCORRECT};
  background-color: ${(props) =>
    props.isCorrect
      ? `${QUIZ_CONFIG.COLORS.CORRECT}10`
      : `${QUIZ_CONFIG.COLORS.INCORRECT}10`};
`;

const AnswerQuestion = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-family: ${fonts.primary};
`;

const AnswerDetails = styled.div`
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  font-family: ${fonts.primary};
`;

const RestartButton = styled.button`
  display: block;
  margin: 2rem auto 0;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  background-color: ${QUIZ_CONFIG.COLORS.PRIMARY};
  color: white;
  transition: background-color 0.2s ease;
  font-family: ${fonts.primary};

  &:hover {
    background-color: ${QUIZ_CONFIG.COLORS.PRIMARY}dd;
  }
`;

interface ResultsScreenProps {
  results: QuizResults;
  onRestart: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  results,
  onRestart,
}) => {
  return (
    <ResultsContainer>
      <QuizScore
        score={results.score}
        correctAnswers={results.correctAnswers}
        totalQuestions={results.totalQuestions}
      />

      <QuizStats
        totalQuestions={results.totalQuestions}
        correctAnswers={results.correctAnswers}
        timeSpent={results.timeSpent}
      />

      <AnswerReview answers={results.answers} />

      <RestartButton onClick={onRestart}>Start New Quiz</RestartButton>
    </ResultsContainer>
  );
};
