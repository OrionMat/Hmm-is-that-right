import React, { useState } from "react";
import styled from "styled-components";
import { IsActiveNewsSources, NewsPiece } from "./dataModel/dataModel";
import { getNewsPieces } from "./getNewsPieces";
import { SearchIcon } from "./Icons";

interface Props {
  sourceStates: IsActiveNewsSources;
  setNewsPieces(newsPieces: NewsPiece[]): void;
}

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
  border: 1px solid #dfe1e5;
  border-radius: 25px;
  z-index: 3;
  padding-left: 60px;
  :hover {
    box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
    border-color: rgba(223, 225, 229, 0);
  }
  :focus {
    outline: none;
    box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
    border-color: rgba(223, 225, 229, 0);
  }
  ::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
`;

export const SearchBar = (props: Props) => {
  const [statement, setStatement] = useState("");

  return (
    <SearchForm
      onSubmit={async (event) => {
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
        onChange={(event) => setStatement(event.target.value)}
      />
    </SearchForm>
  );
};
