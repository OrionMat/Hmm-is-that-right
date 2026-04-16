import { useState } from "react";
import { SearchBar } from "./components/SearchBar";
import {
  NewsPiece,
  permanentSourceUrls,
  PermanentNewsSources,
} from "../../dataModel/dataModel";
import { Tile } from "./components/Tile";
import { ResultsTable } from "./components/ResultsTable";
import { PageContainer } from "../../components/PageContainer";

export const FactCheck = () => {
  /** active/disabled states for news agencies */
  const [sourceStates, setSourceStates] = useState({
    bbc: true,
    nyt: true,
    ap: true,
    reuters: true,
    twitter: true,
    deeplearning: false,
  });

  /** state populated by retrieved news pieces */
  const [newsPieces, setNewsPieces] = useState<NewsPiece[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <SearchBar sourceStates={sourceStates} setNewsPieces={setNewsPieces} setIsLoading={setIsLoading} isLoading={isLoading} />
      <div className="tile-row">
        {newsSources.map(({ source, url, isActive }) => (
          <Tile
            key={source}
            source={source}
            isActive={isActive}
            url={url}
            handleClick={(newsIsActive) =>
              toggleSource(source as keyof typeof sourceStates, newsIsActive)
            }
          />
        ))}
      </div>
      </div>
      {!isLoading && newsPieces.length > 0 && <ResultsTable newsPieces={newsPieces} />}
    </PageContainer>
  );
};
