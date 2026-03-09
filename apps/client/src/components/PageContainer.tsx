import React from "react";
import styles from "./PageContainer.module.css";

export const PageContainer = ({ 
  children, 
  id 
}: { 
  children: React.ReactNode; 
  id?: string 
}) => {
  return (
    <div id={id} className={styles.pageContainer}>
      {children}
    </div>
  );
};
