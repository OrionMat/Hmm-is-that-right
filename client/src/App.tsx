import React, { useState } from "react";
import styled from "styled-components";
import { SearchBar } from "./SearchBar";
import {
  NewsPiece,
  permanentSourceUrls,
  PermanentNewsSources,
} from "./dataModel/dataModel";
import { Tile } from "./Tile";
import { ResultsTable } from "./ResultsTable";

const initialNewsSources = {
  bbc: true,
  nyt: true,
  ap: true,
  reuters: true,
  twitter: true,
};

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

export const App = () => {
  /** active/desabled states for news agencies */
  const [sourceStates, setSourceStates] = useState(initialNewsSources);
  const newSourceStates = Object.assign({}, sourceStates);

  /** state popullated by retrieved news pieces */
  const [newsPieces, setNewsPieces] = useState<NewsPiece[]>([]);

  /** builds array of news agencies to populate the select tiles */
  const newsSources = Object.entries(sourceStates).map(
    ([source, isActive]) => ({
      source,
      isActive,
      url: permanentSourceUrls[source as keyof PermanentNewsSources],
    })
  );

  return (
    <ContentContainer id="content">
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
    </ContentContainer>
  );
};
