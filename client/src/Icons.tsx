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
