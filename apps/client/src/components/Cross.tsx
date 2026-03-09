import React from "react";
import styles from "./Common.module.css";

export const Cross = () => (
  <div className={`${styles.iconWrapper} ${styles.cross}`} aria-hidden="true">
    ✕
  </div>
);
