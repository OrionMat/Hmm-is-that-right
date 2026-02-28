import React from "react";
import styled from "styled-components";
import { fonts } from "../styles/fonts";

const QuizCardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  font-family: ${fonts.primary};
  border: 1px solid #e0e0e0;
`;

const QuizCardContent = styled.div`
  min-height: 300px;
`;

interface QuizCardProps {
  children: React.ReactNode;
}

export const QuizCard: React.FC<QuizCardProps> = ({ children }) => {
  return (
    <QuizCardContainer>
      <QuizCardContent>{children}</QuizCardContent>
    </QuizCardContainer>
  );
};
