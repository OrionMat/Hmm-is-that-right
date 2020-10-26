import React from "react";
import styled from "styled-components";
import { ReactComponent as SearchIconSVG } from "./images/searchIcon.svg";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 750px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 500px;
  margin: auto;
  align-items: center;
`;

const SearchBar = styled.input`
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

const SearchIcon = styled(SearchIconSVG)`
  position: absolute;
  margin-left: 10px;
  width: 40px;
  height: 100%;
`;

const ButtonsWrapper = styled.div``;

const App = () => {
  return (
    <ContentWrapper id="content">
      <SearchWrapper>
        <SearchIcon />
        <SearchBar
          id="input"
          type="search"
          autoComplete="off"
          spellCheck="false"
          placeholder="Check a fact or statement"
        />
      </SearchWrapper>
      <ButtonsWrapper>{}</ButtonsWrapper>
    </ContentWrapper>
  );
};

export default App;
