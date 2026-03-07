import React from "react";
import styled from "styled-components";
import { NewsPiece } from "../dataModel/dataModel";
import { SelectNewsIcon as selectNewsIcon } from "../Icons";
import { colors } from "../styles/colors";
import { fonts } from "../styles/fonts";

const Table = styled.table`
  width: 75%;
  margin-top: 25px;
  font-family: ${fonts.primary};
  border-collapse: collapse;

  tbody {
    tr {
      border-radius: 0.25rem;
      box-shadow: 0 1px 6px -1px ${colors.darkGrey};
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

export const ResultsTable = (props: { newsPieces: NewsPiece[] }) => {
  return (
    <Table>
      <tbody>
        {props.newsPieces.map((newsPiece) => (
          <tr key={newsPiece.url}>
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
