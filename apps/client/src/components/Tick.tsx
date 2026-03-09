import React from "react";
import styles from "./Common.module.css";

export const Tick = () => (
  <div className={`${styles.iconWrapper} ${styles.tick}`} aria-hidden="true">
    ✓
  </div>
);
