import React from "react";
import styled from "styled-components";
import { ReactComponent as SearchIconSVG } from "./images/searchIcon.svg";
import { ReactComponent as BBCSVG } from "./images/BBCcurved.svg";

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 750px;
`;

const SearchContainer = styled.div`
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

const TileContainer = styled.div``;

const NewsIcon = styled(BBCSVG)`
  height: 45px;
  width: 45px;
`;

interface newsAgency {
  agency: string;
  url: string;
  isDisabled: boolean;
}

const Tile = () => {
  return (
    <button>
      <NewsIcon />
      BBC
    </button>
  );
};

// <img src={/**/} />
const App = () => {
  let newsAgencies: newsAgency[] = [
    { agency: "BBC", url: "https://www.bbc.co.uk", isDisabled: false },
    { agency: "NYT", url: "https://www.nyt.com", isDisabled: false },
    { agency: "KBC", url: "https://www.kbc.ke", isDisabled: false },
    { agency: "SSS", url: "https://www.sss.sa", isDisabled: false },
  ];

  const renderTiles = (newsAgencies: newsAgency[]) => {
    return newsAgencies.map((newAgency) => <button>{newAgency.agency}</button>); // change button to Tile
  };

  return (
    <ContentContainer id="content">
      <SearchContainer>
        <SearchIcon />
        <SearchBar
          id="input"
          type="search"
          autoComplete="off"
          spellCheck="false"
          placeholder="Check a fact or statement"
        />
      </SearchContainer>
      <TileContainer>
        {renderTiles(newsAgencies)}
        <Tile />
      </TileContainer>
    </ContentContainer>
  );
};

export default App;
