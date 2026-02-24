import React from "react";
import styled from "styled-components";
import { fonts } from "../styles/fonts";

const QuestionText = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  margin: 0 0 2rem 0;
  text-align: center;
  font-family: ${fonts.primary};
`;

interface QuestionProps {
  text: string;
}

export const Question: React.FC<QuestionProps> = ({ text }) => {
  return <QuestionText>{text}</QuestionText>;
};
