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
import styles from "./Icons.module.css";

export const SearchIcon = () => <SearchIconSVG className={styles.searchIcon} />;
export const BBCIcon = () => <BBCSVG className={styles.standardIcon} />;
export const BBCGreyIcon = () => <BBCGreySVG className={styles.standardIcon} />;
export const NYTIcon = () => <NYTSVG className={styles.standardIcon} />;
export const NYTGreyIcon = () => <NYTGreySVG className={styles.standardIcon} />;
export const APIcon = () => <APSVG className={styles.standardIcon} />;
export const APGreyIcon = () => <APGreySVG className={styles.standardIcon} />;
export const ReutersIcon = () => <ReutersSVG className={styles.standardIcon} />;
export const ReutersGreyIcon = () => <ReutersGreySVG className={styles.standardIcon} />;
export const TwitterIcon = () => <TwitterSVG className={styles.standardIcon} />;
export const TwitterGreyIcon = () => <TwitterGreySVG className={styles.standardIcon} />;

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
