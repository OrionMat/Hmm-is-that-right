import React from "react";
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

export const SearchIcon = () => <SearchIconSVG className="absolute left-[10px] top-1/2 -translate-y-1/2 w-10 h-10 z-10 pointer-events-none" />;
export const BBCIcon = () => <BBCSVG className="h-[45px] w-[45px]" />;
export const BBCGreyIcon = () => <BBCGreySVG className="h-[45px] w-[45px]" />;
export const NYTIcon = () => <NYTSVG className="h-[45px] w-[45px]" />;
export const NYTGreyIcon = () => <NYTGreySVG className="h-[45px] w-[45px]" />;
export const APIcon = () => <APSVG className="h-[45px] w-[45px]" />;
export const APGreyIcon = () => <APGreySVG className="h-[45px] w-[45px]" />;
export const ReutersIcon = () => <ReutersSVG className="h-[45px] w-[45px]" />;
export const ReutersGreyIcon = () => <ReutersGreySVG className="h-[45px] w-[45px]" />;
export const TwitterIcon = () => <TwitterSVG className="h-[45px] w-[45px]" />;
export const TwitterGreyIcon = () => <TwitterGreySVG className="h-[45px] w-[45px]" />;

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
