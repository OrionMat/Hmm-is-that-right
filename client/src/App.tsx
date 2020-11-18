import React, { useState } from "react";
import styled from "styled-components";
import { ReactComponent as SearchIconSVG } from "./images/searchIcon.svg";
import { ReactComponent as BBCSVG } from "./images/BBCcurved.svg";
import { ReactComponent as BBCGreySVG } from "./images/BBCcurvedGrey.svg";
import { ReactComponent as NYTSVG } from "./images/NYT.svg";
import { ReactComponent as NYTGreySVG } from "./images/NYTGrey.svg";
import { ReactComponent as APSVG } from "./images/AP.svg";
import { ReactComponent as APGreySVG } from "./images/APGrey.svg";
import { ReactComponent as ReutersSVG } from "./images/Reuters.svg";
import { ReactComponent as ReutersGreySVG } from "./images/ReutersGrey.svg";
import { ReactComponent as TwitterSVG } from "./images/Twitter.svg";
import { ReactComponent as TwitterGreySVG } from "./images/TwitterGrey.svg";

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
  margin-top: 300px;
  margin-bottom: 50px;
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

const TileContainer = styled.div`
  width: 500px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-content: space-between;
`;

const Tile = ({
  agency,
  url,
  isActive,
  handelClick,
}: INewsAgency & { handelClick: (agency: string) => void }) => {
  // const [isDisabled, setDisabled] = useState(false);

  const renderNewsIcon = (agency: string, isActive: boolean) => {
    if (isActive) {
      switch (agency.toUpperCase()) {
        case "BBC":
          return <BBCIcon />;
        case "NYT":
          return <NYTIcon />;
        case "AP":
          return <APIcon />;
        case "REUTERS":
          return <ReutersIcon />;
        case "TWITTER":
          return <TwitterIcon />;
        default:
          console.log("Agency is not recognised as a case");
          break;
      }
    } else {
      switch (agency.toUpperCase()) {
        case "BBC":
          return <BBCGreyIcon />;
        case "NYT":
          return <NYTGreyIcon />;
        case "AP":
          return <APGreyIcon />;
        case "REUTERS":
          return <ReutersGreyIcon />;
        case "TWITTER":
          return <TwitterGreyIcon />;
        default:
          console.log("Agency is not recognised as a case");
          break;
      }
    }
  };

  return (
    <Button onClick={() => handelClick(agency)}>
      {renderNewsIcon(agency, isActive)}
    </Button>
  );
};

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

const BBCIcon = styled(BBCSVG)`
  height: 45px;
  width: 45px;
`;

const BBCGreyIcon = styled(BBCGreySVG)`
  height: 45px;
  width: 45px;
`;

const NYTIcon = styled(NYTSVG)`
  height: 45px;
  width: 45px;
`;

const NYTGreyIcon = styled(NYTGreySVG)`
  height: 45px;
  width: 45px;
`;

const APIcon = styled(APSVG)`
  height: 45px;
  width: 45px;
`;

const APGreyIcon = styled(APGreySVG)`
  height: 45px;
  width: 45px;
`;

const ReutersIcon = styled(ReutersSVG)`
  height: 45px;
  width: 45px;
`;

const ReutersGreyIcon = styled(ReutersGreySVG)`
  height: 45px;
  width: 45px;
`;

const TwitterIcon = styled(TwitterSVG)`
  height: 45px;
  width: 45px;
`;

const TwitterGreyIcon = styled(TwitterGreySVG)`
  height: 45px;
  width: 45px;
`;

interface INewsAgency {
  agency: string;
  url: string;
  isActive: boolean;
}

// <img src={/**/} />
const App = () => {
  const [isActive, setActive] = useState({
    isBbcActive: true,
    isNytActive: true,
    isApActive: true,
    isReutersActive: true,
    isTwitterActive: true,
  });
  let newsAgencies: INewsAgency[] = [
    {
      agency: "BBC",
      url: "https://www.bbc.co.uk",
      isActive: isActive.isBbcActive,
    },
    {
      agency: "NYT",
      url: "https://www.nyt.com",
      isActive: isActive.isNytActive,
    },
    { agency: "AP", url: "https://www.AP.com", isActive: isActive.isApActive },
    {
      agency: "Reuters",
      url: "https://www.Reuters.sa",
      isActive: isActive.isReutersActive,
    },
    {
      agency: "Twitter",
      url: "https://www.twitter.com",
      isActive: isActive.isTwitterActive,
    },
  ];

  const renderTiles = (newsAgencies: INewsAgency[]) => {
    return newsAgencies.map((newsAgency) => (
      <Tile
        agency={newsAgency.agency}
        url={newsAgency.url}
        isActive={newsAgency.isActive}
        handelClick={(agency: string) => {
          switch (agency.toUpperCase()) {
            case "BBC":
              setActive({ ...isActive, isBbcActive: !isActive.isBbcActive });
              break;
            case "NYT":
              setActive({ ...isActive, isNytActive: !isActive.isNytActive });
              break;
            case "AP":
              setActive({ ...isActive, isApActive: !isActive.isApActive });
              break;
            case "REUTERS":
              setActive({
                ...isActive,
                isReutersActive: !isActive.isReutersActive,
              });
              break;
            case "TWITTER":
              setActive({
                ...isActive,
                isTwitterActive: !isActive.isTwitterActive,
              });
              break;
            default:
              console.log(
                "Agency is not recognised as a case. Set active state of tile error."
              );
              break;
          }
        }}
      />
    ));
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
      <TileContainer>{renderTiles(newsAgencies)}</TileContainer>
    </ContentContainer>
  );
};

export default App;
