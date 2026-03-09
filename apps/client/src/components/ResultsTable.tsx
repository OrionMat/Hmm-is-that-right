import React from "react";
import { NewsPiece } from "../dataModel/dataModel";
import { SelectNewsIcon } from "../Icons";
import styles from "./ResultsTable.module.css";

interface ResultsTableProps {
  newsPieces: NewsPiece[];
}

export const ResultsTable = ({ newsPieces }: ResultsTableProps) => {
  return (
    <table className={styles.table}>
      <tbody>
        {newsPieces.map((newsPiece) => (
          <tr key={newsPiece.url}>
            <td>
              <div className={styles.newsIcon}>
                {SelectNewsIcon(newsPiece.source, true)}
              </div>
            </td>
            <td>
              <div className={styles.newsTitle}>
                <a href={newsPiece.url}>{newsPiece.title}</a>
              </div>
            </td>
            <td>
              <div className={styles.newsBody}>{newsPiece.body.join("\n")}</div>
            </td>
            <td>
              <div>{newsPiece.date}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
