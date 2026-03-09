import React from "react";
import { SelectNewsIcon } from "../Icons";
import styles from "./Tile.module.css";

interface TileProps {
  source: string;
  isActive: boolean;
  url: string;
  handelClick(toggledState: boolean): void;
}

export const Tile = ({ source, isActive, handelClick }: TileProps) => {
  return (
    <button 
      className={styles.button} 
      onClick={() => handelClick(!isActive)}
      aria-pressed={isActive}
    >
      {SelectNewsIcon(source, isActive)}
    </button>
  );
};
