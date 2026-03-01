import React from 'react';
import styled from 'styled-components';
import { fonts } from '../../styles/fonts';
import { QUIZ_CONFIG } from '../../constants/quiz';

const StatsContainer = styled.div`
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
  color: ${QUIZ_CONFIG.COLORS.GREY};
  margin-top: 0.5rem;
  font-family: ${fonts.primary};
`;

interface QuizStatsProps {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}

export const QuizStats: React.FC<QuizStatsProps> = ({
  totalQuestions,
  correctAnswers,
  timeSpent,
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <StatsContainer>
      <StatCard>
        <StatValue>{totalQuestions}</StatValue>
        <StatLabel>Total Questions</StatLabel>
      </StatCard>
      <StatCard>
        <StatValue>{correctAnswers}</StatValue>
        <StatLabel>Correct Answers</StatLabel>
      </StatCard>
      <StatCard>
        <StatValue>{formatTime(timeSpent)}</StatValue>
        <StatLabel>Time Spent</StatLabel>
      </StatCard>
    </StatsContainer>
  );
};
