import React from "react";
import { styled } from "styled-components";
import { colors } from "../styles/colors";

const StyledTick = styled.div`
  width: 0.75rem;
  padding-right: 0.5rem;
  color: ${colors.green};
`;

export const Tick = () => <StyledTick aria-hidden="true">✓</StyledTick>;
