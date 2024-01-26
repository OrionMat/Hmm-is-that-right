import React, { useState } from "react";
import styled from "styled-components";
import { IsActiveNewsSources, NewsPiece } from "../dataModel/dataModel";
import { getNewsPieces } from "../service/getNewsPieces";
import { SearchIcon } from "../Icons";
import { colors } from "../styles/colors";
import { fonts } from "../styles/fonts";

const SearchForm = styled.form`
  position: relative;
  width: 500px;
  margin: auto;
  margin-top: 300px;
  margin-bottom: 25px;
  align-items: center;
`;

const SearchInput = styled.input`
  height: 50px;
  width: 100%;
  border: 1px solid ${colors.lightGrey};
  border-radius: 25px;
  z-index: 3;
  padding-left: 60px;
  font-family: ${fonts.primary};
  :hover {
    box-shadow: 0 1px 6px ${colors.darkGrey};
    border-color: transparent;
  }
  :focus {
    outline: none;
    box-shadow: 0 1px 6px ${colors.darkGrey};
    border-color: transparent;
  }
  ::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
`;

export const SearchBar = (props: {
  sourceStates: IsActiveNewsSources;
  setNewsPieces(newsPieces: NewsPiece[]): void;
}) => {
  const [statement, setStatement] = useState("");

  return (
    <SearchForm
      onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("submitted statement: ", statement);
        console.log("active sources: ", props.sourceStates);

        const news = await getNewsPieces(statement, props.sourceStates);
        props.setNewsPieces(news);
      }}
    >
      <SearchIcon />
      <SearchInput
        id="input"
        type="search"
        autoComplete="off"
        spellCheck="false"
        placeholder="Check a fact or statement"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setStatement(event.target.value)
        }
      />
    </SearchForm>
  );
};
