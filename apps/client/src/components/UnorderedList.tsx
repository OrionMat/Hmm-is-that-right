import React from "react";
import styles from "./Common.module.css";

export const UnorderedList = ({ children }: { children: React.ReactNode }) => (
  <ul className={styles.unorderedList}>{children}</ul>
);
