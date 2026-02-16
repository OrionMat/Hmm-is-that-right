import React from "react";
import styled from "styled-components";
import SearchIconSVG from "./images/searchIcon.svg?react";
import BBCSVG from "./images/BBCcurved.svg?react";
import BBCGreySVG from "./images/BBCcurvedGrey.svg?react";
import NYTSVG from "./images/NYT.svg?react";
import NYTGreySVG from "./images/NYTGrey.svg?react";
import APSVG from "./images/AP.svg?react";
import APGreySVG from "./images/APGrey.svg?react";
import ReutersSVG from "./images/Reuters.svg?react";
import ReutersGreySVG from "./images/ReutersGrey.svg?react";
import TwitterSVG from "./images/Twitter.svg?react";
import TwitterGreySVG from "./images/TwitterGrey.svg?react";

const iconStandardHeight = "45px";
const iconStandardWidth = "45px";

export const SearchIcon = styled(SearchIconSVG)`
  position: absolute;
  margin-left: 10px;
  width: 40px;
  height: 100%;
`;

export const BBCIcon = styled(BBCSVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const BBCGreyIcon = styled(BBCGreySVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const NYTIcon = styled(NYTSVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const NYTGreyIcon = styled(NYTGreySVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const APIcon = styled(APSVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const APGreyIcon = styled(APGreySVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const ReutersIcon = styled(ReutersSVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const ReutersGreyIcon = styled(ReutersGreySVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const TwitterIcon = styled(TwitterSVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const TwitterGreyIcon = styled(TwitterGreySVG)`
  height: ${iconStandardHeight};
  width: ${iconStandardWidth};
`;

export const SelectNewsIcon = (source: string, isActive: boolean) => {
  if (isActive) {
    switch (source.toUpperCase()) {
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
        console.log("Source is not recognised as a case");
        break;
    }
  } else {
    switch (source.toUpperCase()) {
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
