import React from "react";
import styled from "styled-components";
import { fonts } from "../styles/fonts";
import { QUIZ_CONFIG } from "../constants/quiz";

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 2rem auto 0;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: ${QUIZ_CONFIG.COLORS.GREY};
  font-family: ${fonts.primary};
`;

const ProgressBarBackground = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${QUIZ_CONFIG.COLORS.LIGHT_GREY};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $progress: number }>`
  height: 100%;
  background-color: ${QUIZ_CONFIG.COLORS.PRIMARY};
  border-radius: 4px;
  transition: width 0.3s ease;
  width: ${(props) => props.$progress}%;
`;

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <ProgressContainer>
      <ProgressText>
        Question {current} of {total}
      </ProgressText>
      <ProgressBarBackground>
        <ProgressBarFill $progress={progress} />
      </ProgressBarBackground>
    </ProgressContainer>
  );
};
