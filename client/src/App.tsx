import React, { useState } from "react";
import styled from "styled-components";
import SearchBar from "./SearchBar";
import {
  NewsSource,
  NewsPiece,
  permanentSources,
  permanentSourceUrls,
  PermanentNewsSources,
} from "./dataModel/dataModel";
import Tile from "./Tile";

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 750px;
`;

const TileContainer = styled.div`
  width: 500px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-content: space-between;
  margin-top: 25px;
  margin-bottom: 50px;
`;

const NewsResultsTable = styled.table`
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

const App = () => {
  /** active/desabled states for news agencies */
  const [sourceStates, setSourceStates] = useState({
    bbc: true,
    nyt: true,
    ap: true,
    reuters: true,
    twitter: true,
  });
  /** state popullated by news pieces */
  const [newsPieces, setNewsPieces] = useState<NewsPiece[]>([]);

  /** array of news agencies to populate the select tiles */
  const newsSources: NewsSource[] = [
    {
      source: permanentSources.bbc,
      url: permanentSourceUrls.bbc,
      isActive: sourceStates.bbc,
    },
    {
      source: permanentSources.nyt,
      url: permanentSourceUrls.nyt,
      isActive: sourceStates.nyt,
    },
    {
      source: permanentSources.ap,
      url: permanentSourceUrls.ap,
      isActive: sourceStates.ap,
    },
    {
      source: permanentSources.reuters,
      url: permanentSourceUrls.reuters,
      isActive: sourceStates.reuters,
    },
    {
      source: permanentSources.twitter,
      url: permanentSourceUrls.twitter,
      isActive: sourceStates.twitter,
    },
  ];

  const renderNewsResults = () => {
    return (
      <tbody>
        {newsPieces.map((newsPiece) => {
          return (
            <tr>
              <td>
                <div>{newsPiece.source}</div>
              </td>
              <td>
                <div>{newsPiece.title}</div>
              </td>
              <td>
                <div>{newsPiece.date}</div>
              </td>
              <td>
                <div>{newsPiece.author}</div>
              </td>
              <td>
                <div>{newsPiece.body}</div>
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  return (
    <ContentContainer id="content">
      <SearchBar sourceStates={sourceStates} setNewsPieces={setNewsPieces} />
      <TileContainer>
        {newsSources.map(({ source, url, isActive }, index) => (
          <Tile
            key={index}
            source={source}
            isActive={isActive}
            url={url}
            handelClick={(newIsActive) => {
              const newSourceStates = Object.assign({}, sourceStates);
              newSourceStates[
                source as keyof PermanentNewsSources
              ] = newIsActive;
              setSourceStates(newSourceStates);
            }}
          />
        ))}
      </TileContainer>
      <NewsResultsTable>{renderNewsResults()}</NewsResultsTable>
    </ContentContainer>
  );
};

export default App;
