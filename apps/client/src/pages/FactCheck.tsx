import React, { useState } from "react";
import styled from "styled-components";
import { SearchBar } from "../components/SearchBar";
import {
  NewsPiece,
  permanentSourceUrls,
  PermanentNewsSources,
} from "../dataModel/dataModel";
import { Tile } from "../components/Tile";
import { ResultsTable } from "../components/ResultsTable";
import { PageContainer } from "../components/PageContainer";

const TileContainer = styled.div`
  width: 500px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-content: space-between;
  margin-top: 25px;
  margin-bottom: 50px;
`;

export const FactCheck = () => {
  /** active/disabled states for news agencies */
  const [sourceStates, setSourceStates] = useState({
    bbc: true,
    nyt: true,
    ap: true,
    reuters: true,
    twitter: true,
  });
  const newSourceStates = Object.assign({}, sourceStates);

  /** state populated by retrieved news pieces */
  const [newsPieces, setNewsPieces] = useState<NewsPiece[]>([]);

  /** builds array of news agencies to populate the select tiles */
  const newsSources = Object.entries(sourceStates).map(
    ([source, isActive]) => ({
      source,
      isActive,
      url: permanentSourceUrls[source as keyof PermanentNewsSources],
    }),
  );

  return (
    <PageContainer id="content">
      <SearchBar sourceStates={sourceStates} setNewsPieces={setNewsPieces} />
      <TileContainer>
        {newsSources.map(({ source, url, isActive }, index) => (
          // map array of news sources to tiles
          <Tile
            key={index}
            source={source}
            isActive={isActive}
            url={url}
            handelClick={(newsIsActive) => {
              newSourceStates[source as keyof PermanentNewsSources] =
                newsIsActive;
              setSourceStates(newSourceStates);
            }}
          />
        ))}
      </TileContainer>
      {newsPieces.length > 0 ? (
        <ResultsTable newsPieces={newsPieces} />
      ) : undefined}
    </PageContainer>
  );
};
