import SearchIconSVG from "../images/searchIcon.svg?react";
import BBCSVG from "../images/BBCcurved.svg?react";
import BBCGreySVG from "../images/BBCcurvedGrey.svg?react";
import NYTSVG from "../images/NYT.svg?react";
import NYTGreySVG from "../images/NYTGrey.svg?react";
import APSVG from "../images/AP.svg?react";
import APGreySVG from "../images/APGrey.svg?react";
import ReutersSVG from "../images/Reuters.svg?react";
import ReutersGreySVG from "../images/ReutersGrey.svg?react";
import TwitterSVG from "../images/Twitter.svg?react";
import TwitterGreySVG from "../images/TwitterGrey.svg?react";

export const SearchIcon = () => (
  <SearchIconSVG className="absolute left-[10px] top-1/2 -translate-y-1/2 w-10 h-10 z-10 pointer-events-none" />
);
export const BBCIcon = () => <BBCSVG className="h-[45px] w-[45px]" />;
export const BBCGreyIcon = () => <BBCGreySVG className="h-[45px] w-[45px]" />;
export const NYTIcon = () => <NYTSVG className="h-[45px] w-[45px]" />;
export const NYTGreyIcon = () => <NYTGreySVG className="h-[45px] w-[45px]" />;
export const APIcon = () => <APSVG className="h-[45px] w-[45px]" />;
export const APGreyIcon = () => <APGreySVG className="h-[45px] w-[45px]" />;
export const ReutersIcon = () => <ReutersSVG className="h-[45px] w-[45px]" />;
export const ReutersGreyIcon = () => (
  <ReutersGreySVG className="h-[45px] w-[45px]" />
);
export const TwitterIcon = () => <TwitterSVG className="h-[45px] w-[45px]" />;
export const TwitterGreyIcon = () => (
  <TwitterGreySVG className="h-[45px] w-[45px]" />
);

const TextIcon = ({ text, isActive }: { text: string; isActive: boolean }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 45,
      height: 45,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: "monospace",
      color: isActive ? "var(--color-dark-grey)" : "var(--color-light-grey)",
      border: `1.5px solid ${isActive ? "var(--color-dark-grey)" : "var(--color-light-grey)"}`,
      borderRadius: 4,
      letterSpacing: "0.05em",
    }}
  >
    {text}
  </span>
);

export const SelectNewsIcon = ({
  source,
  isActive,
}: {
  source: string;
  isActive: boolean;
}) => {
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
        return <TextIcon text={source.toUpperCase().slice(0, 5)} isActive={true} />;
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
        return <TextIcon text={source.toUpperCase().slice(0, 5)} isActive={false} />;
    }
  }
};
