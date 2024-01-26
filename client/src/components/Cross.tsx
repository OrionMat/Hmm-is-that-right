import React from "react";
import { styled } from "styled-components";
import { colors } from "../styles/colors";

const StyledCross = styled.div`
  width: 0.75rem;
  padding-right: 0.5rem;
  color: ${colors.dangerRed};
`;

export const Cross = () => <StyledCross aria-hidden="true">✕</StyledCross>;
