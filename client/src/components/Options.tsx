import React from "react";
import styled from "styled-components";
import { fonts } from "../styles/fonts";
import { QuizOption } from "../dataModel/quizModel";
import { QUIZ_CONFIG } from "../constants/quiz";
import {
  getOptionBorderColor,
  getOptionBackgroundColor,
  getOptionHoverBackgroundColor,
  getOptionCircleColor,
} from "../utils/quizColors";

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionLabel = styled.label<{
  $isSelected: boolean;
  $isCorrect?: boolean;
  $showFeedback?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid
    ${(props) =>
      getOptionBorderColor(
        props.$isSelected,
        props.$isCorrect,
        props.$showFeedback,
      )};
  background-color: ${(props) =>
    getOptionBackgroundColor(
      props.$isSelected,
      props.$isCorrect,
      props.$showFeedback,
    )};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${fonts.primary};

  &:hover {
    border-color: ${(props) =>
      getOptionBorderColor(
        props.$isSelected,
        props.$isCorrect,
        props.$showFeedback,
      )};
    background-color: ${(props) =>
      getOptionHoverBackgroundColor(
        props.$isSelected,
        props.$isCorrect,
        props.$showFeedback,
      )};
  }
`;

const RadioInput = styled.input`
  display: none;
`;

const OptionLabelCircle = styled.div<{
  $isSelected: boolean;
  $isCorrect?: boolean;
  $showFeedback?: boolean;
}>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid
    ${(props) =>
      getOptionBorderColor(
        props.$isSelected,
        props.$isCorrect,
        props.$showFeedback,
      )};
  background-color: ${(props) =>
    getOptionCircleColor(
      props.$isSelected,
      props.$isCorrect,
      props.$showFeedback,
    )};
  margin-right: 1rem;
  position: relative;
  flex-shrink: 0;
  font-family: ${fonts.primary};
`;

const OptionLabelText = styled.span`
  font-size: 1rem;
  color: #333;
  line-height: 1.4;
  font-family: ${fonts.primary};
`;

const OptionLabelLetter = styled.span`
  font-weight: 600;
  margin-right: 0.5rem;
  color: ${QUIZ_CONFIG.COLORS.PRIMARY};
  font-family: ${fonts.primary};
`;

interface OptionsProps {
  options: QuizOption[];
  selectedOptionId?: string;
  correctAnswerId?: string;
  showFeedback?: boolean;
  onOptionSelect: (optionId: string) => void;
}

export const Options: React.FC<OptionsProps> = ({
  options,
  selectedOptionId,
  correctAnswerId,
  showFeedback = false,
  onOptionSelect,
}) => {
  return (
    <OptionsContainer>
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        const isCorrect = correctAnswerId === option.id;

        return (
          <OptionLabel
            key={option.id}
            $isSelected={isSelected}
            $isCorrect={isCorrect}
            $showFeedback={showFeedback}
          >
            <RadioInput
              type="radio"
              name="quiz-option"
              value={option.id}
              checked={isSelected}
              onChange={() => onOptionSelect(option.id)}
            />
            <OptionLabelCircle
              $isSelected={isSelected}
              $isCorrect={isCorrect}
              $showFeedback={showFeedback}
            />
            <OptionLabelText>
              <OptionLabelLetter>{option.label}.</OptionLabelLetter>
              {option.text}
            </OptionLabelText>
          </OptionLabel>
        );
      })}
    </OptionsContainer>
  );
};
