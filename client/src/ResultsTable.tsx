import React from "react";
import styled from "styled-components";
import { NewsPiece } from "./dataModel/dataModel";
import { SelectNewsIcon as selectNewsIcon } from "./Icons";

interface Props {
  newsPieces: NewsPiece[];
}

const Table = styled.table`
  width: 75%;
  margin-top: 25px;
  font-family: "Nunito", sans-serif;
  border-collapse: collapse;

  tbody {
    tr {
      border-radius: 0.25rem;
      box-shadow: 0 1px 6px -1px rgba(32, 33, 36, 0.28);
      td {
        padding: 20px;
        div {
          min-width: 250px;
          text-align: justify;
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;

          &.news-icon {
            min-width: initial;
          }

          &.news-title {
            min-width: 300px;
          }

          &.news-body {
            max-width: max-content;
          }
        }
      }
    }
  }
`;

export const ResultsTable = (props: Props) => {
  return (
    <Table>
      <tbody>
        {props.newsPieces.map((newsPiece) => (
          <tr>
            <td>
              <div className="news-icon">
                {selectNewsIcon(newsPiece.source, true)}
              </div>
            </td>
            <td>
              <div className="news-title">
                <a href={newsPiece.url}>{newsPiece.title}</a>
              </div>
            </td>
            <td>
              <div className="news-body">{newsPiece.body.join("\n")}</div>
            </td>
            <td>
              <div>{newsPiece.date}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
