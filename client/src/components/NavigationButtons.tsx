import React from "react";
import styled from "styled-components";
import { fonts } from "../styles/fonts";
import { QUIZ_CONFIG } from "../constants/quiz";

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 2rem auto 0;
`;

const NavigationButton = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) =>
    props.variant === "primary" ? QUIZ_CONFIG.COLORS.PRIMARY : "white"};
  color: ${(props) =>
    props.variant === "primary" ? "white" : QUIZ_CONFIG.COLORS.PRIMARY};
  border: 2px solid ${QUIZ_CONFIG.COLORS.PRIMARY};
  font-family: ${fonts.primary};

  &:hover {
    background-color: ${(props) =>
      props.variant === "primary"
        ? `${QUIZ_CONFIG.COLORS.PRIMARY}dd`
        : `${QUIZ_CONFIG.COLORS.PRIMARY}10`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color: ${(props) =>
        props.variant === "primary" ? QUIZ_CONFIG.COLORS.PRIMARY : "white"};
    }
  }
`;

const Spacer = styled.div`
  width: 1px;
`;

interface NavigationButtonsProps {
  onNext: () => void;
  canGoNext: boolean;
  nextLabel?: string;
  showNext?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  canGoNext,
  nextLabel = "Next",
  showNext = true,
}) => {
  return (
    <NavigationContainer>
      <Spacer />

      {showNext && (
        <NavigationButton
          variant="primary"
          onClick={onNext}
          disabled={!canGoNext}
        >
          {nextLabel}
        </NavigationButton>
      )}
    </NavigationContainer>
  );
};
