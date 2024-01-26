import React from "react";
import { styled } from "styled-components";

const StyledArrow = styled.div`
  width: 0.75rem;
  padding-right: 0.5rem;
`;

export const Arrow = () => <StyledArrow aria-hidden="true">→</StyledArrow>;
