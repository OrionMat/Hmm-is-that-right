import React from "react";
import styled from "styled-components";
import { NewsPiece } from "./dataModel/dataModel";

interface Props {
  newsPieces: NewsPiece[];
}

const Table = styled.table`
  width: 75%;
  margin-top: 25px;
  font-family: "Nunito", sans-serif;

  th {
    font-weight: 600;
  }

  td {
    border: 1px solid black;
  }

  td > div {
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ResultsTable = (props: Props) => {
  return (
    <Table>
      <thead>
        <tr>
          <td>source</td>
          <td>title</td>
          <td>body</td>
          <td>date</td>
        </tr>
      </thead>
      <tbody>
        {props.newsPieces.map((newsPiece) => (
          <tr>
            <td>
              <div>{newsPiece.source}</div>
            </td>
            <td>
              <div>{newsPiece.title}</div>
            </td>
            <td>
              <div>{newsPiece.body}</div>
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

export default ResultsTable;
