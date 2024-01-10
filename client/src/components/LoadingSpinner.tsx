import React from "react";
import { styled } from "styled-components";

const Spinner = styled.div`
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  -webkit-animation: spinner-border 0.75s linear infinite;
  animation: spinner-border 0.75s linear infinite;
`;

export const LoadingSpinner = () => {
  return <Spinner />;
};
