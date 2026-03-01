import React from 'react';
import styled from 'styled-components';
import { fonts } from '../../styles/fonts';
import { QUIZ_CONFIG } from '../../constants/quiz';

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
    ${(props) => (props.isCorrect ? QUIZ_CONFIG.COLORS.CORRECT : QUIZ_CONFIG.COLORS.INCORRECT)};
  background-color: ${(props) =>
    props.isCorrect ? `${QUIZ_CONFIG.COLORS.CORRECT}10` : `${QUIZ_CONFIG.COLORS.INCORRECT}10`};
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
  color: ${QUIZ_CONFIG.COLORS.GREY};
  line-height: 1.5;
  font-family: ${fonts.primary};
`;

interface AnswerReviewProps {
  answers: Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export const AnswerReview: React.FC<AnswerReviewProps> = ({ answers }) => {
  return (
    <AnswersSection>
      <AnswersTitle>Review Your Answers</AnswersTitle>
      {answers.map((answer, index) => (
        <AnswerItem key={index} isCorrect={answer.isCorrect}>
          <AnswerQuestion>
            {answer.isCorrect ? "✓" : "✗"} Question {index + 1}:{" "}
            {answer.question}
          </AnswerQuestion>
          <AnswerDetails>
            <div>
              <strong>Your answer:</strong> {answer.userAnswer}
            </div>
            {!answer.isCorrect && (
              <div>
                <strong>Correct answer:</strong> {answer.correctAnswer}
              </div>
            )}
            {answer.explanation && (
              <div>
                <strong>Explanation:</strong> {answer.explanation}
              </div>
            )}
          </AnswerDetails>
        </AnswerItem>
      ))}
    </AnswersSection>
  );
};
