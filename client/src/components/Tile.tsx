import React from "react";
import styled from "styled-components";
import { SelectNewsIcon } from "../Icons";
import { colors } from "../styles/colors";

const Button = styled.button`
  border: 1px solid ${colors.lightGrey};
  background-color: transparent;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  :hover {
    box-shadow: 0 1px 6px ${colors.darkGrey};
    border-color: transparent;
  }
  :focus {
    outline: none;
    box-shadow: 0 0px 16px ${colors.darkGrey};
  }
`;

export const Tile = (props: {
  source: string;
  isActive: boolean;
  url: string;
  handelClick(toggledState: boolean): void;
}) => {
  return (
    <Button onClick={() => props.handelClick(!props.isActive)}>
      {SelectNewsIcon(props.source, props.isActive)}
    </Button>
  );
};
