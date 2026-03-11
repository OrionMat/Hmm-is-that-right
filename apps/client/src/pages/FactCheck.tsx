import React, { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import {
  NewsPiece,
  permanentSourceUrls,
  PermanentNewsSources,
} from "../dataModel/dataModel";
import { Tile } from "../components/Tile";
import { ResultsTable } from "../components/ResultsTable";
import { PageContainer } from "../components/PageContainer";

export const FactCheck = () => {
  /** active/disabled states for news agencies */
  const [sourceStates, setSourceStates] = useState({
    bbc: true,
    nyt: true,
    ap: true,
    reuters: true,
    twitter: true,
  });

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

  const toggleSource = (
    source: keyof typeof sourceStates,
    isActive: boolean,
  ) => {
    setSourceStates((prev) => ({
      ...prev,
      [source]: isActive,
    }));
  };

  return (
    <PageContainer id="content">
      <SearchBar sourceStates={sourceStates} setNewsPieces={setNewsPieces} />
      <div className="w-[500px] flex flex-row flex-wrap justify-evenly content-between mt-6 mb-12">
        {newsSources.map(({ source, url, isActive }, index) => (
          <Tile
            key={index}
            source={source}
            isActive={isActive}
            url={url}
            handelClick={(newsIsActive) =>
              toggleSource(source as keyof typeof sourceStates, newsIsActive)
            }
          />
        ))}
      </div>
      {newsPieces.length > 0 && <ResultsTable newsPieces={newsPieces} />}
    </PageContainer>
  );
};
