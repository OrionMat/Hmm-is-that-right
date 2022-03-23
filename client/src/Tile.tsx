import React from "react";
import styled from "styled-components";
import { SelectNewsIcon } from "./Icons";

const Button = styled.button`
  border: 1px solid #dfe1e5;
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
    box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
    border-color: rgba(223, 225, 229, 0);
  }
  :focus {
    outline: none;
    box-shadow: 0 0px 16px #0005;
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
