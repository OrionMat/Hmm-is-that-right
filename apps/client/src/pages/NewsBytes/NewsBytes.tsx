import { useState } from "react";
import {
  HeadlineSummary,
  IsActiveNewsSources,
  LlmModelId,
  permanentSourceUrls,
  PermanentNewsSources,
} from "../../dataModel/dataModel";
import { getHeadlineNews } from "../../service/getHeadlineNews";
import { Tile } from "../FactCheck/components/Tile";
import { ModelSelector } from "./components/ModelSelector";
import { SummaryCards } from "./components/SummaryCards";
import { PageContainer } from "../../components/PageContainer";
import { LoadingSpinner } from "../../components/LoadingSpinner";

type NewsBytesSources = Omit<IsActiveNewsSources, "twitter">;

const newsBytesSourceUrls: Pick<PermanentNewsSources, "bbc" | "nyt" | "ap" | "reuters" | "deeplearning"> = {
  bbc: permanentSourceUrls.bbc,
  nyt: permanentSourceUrls.nyt,
  ap: permanentSourceUrls.ap,
  reuters: permanentSourceUrls.reuters,
  deeplearning: permanentSourceUrls.deeplearning,
};

export const NewsBytes = () => {
  // Reuters has no public RSS feed and blocks all scraping (401)
  const DISABLED_SOURCES: (keyof NewsBytesSources)[] = ["reuters"];

  const [sourceStates, setSourceStates] = useState<NewsBytesSources>({
    bbc: true,
    nyt: true,
    ap: true,
    reuters: false,
    deeplearning: true,
  });
  const [selectedModel, setSelectedModel] = useState<LlmModelId>("gemini-2.0-flash-lite");
  const [summaries, setSummaries] = useState<HeadlineSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sources = Object.entries(newsBytesSourceUrls).map(([source, url]) => ({
    source,
    url,
    isActive: sourceStates[source as keyof NewsBytesSources],
  }));

  const toggleSource = (source: keyof NewsBytesSources, isActive: boolean) => {
    setSourceStates((prev) => ({ ...prev, [source]: isActive }));
  };

  const handleGo = async () => {
    const activeSources = Object.entries(sourceStates)
      .filter(([, isActive]) => isActive)
      .map(([source]) => source);

    if (activeSources.length === 0) return;

    setIsLoading(true);
    const results = await getHeadlineNews(activeSources, selectedModel);
    setSummaries(results);
    setIsLoading(false);
  };

  return (
    <PageContainer id="news-bytes-content">
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-6">
        <div className="tile-row">
          {sources.map(({ source, url, isActive }) => (
            <Tile
              key={source}
              source={source}
              isActive={isActive}
              url={url}
              disabled={DISABLED_SOURCES.includes(source as keyof NewsBytesSources)}
              handleClick={(newIsActive) =>
                toggleSource(source as keyof NewsBytesSources, newIsActive)
              }
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ModelSelector selectedModel={selectedModel} onChange={setSelectedModel} />
          <button
            className="h-[40px] px-6 border border-light-grey rounded-full font-mono text-sm bg-transparent cursor-pointer transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_1px_6px_var(--color-dark-grey)] focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleGo}
            disabled={isLoading}
          >
            {isLoading && <LoadingSpinner className="w-[14px] h-[14px] border-[1.5px]" />}
            Go
          </button>
        </div>
      </div>
      {!isLoading && summaries.length > 0 && <SummaryCards summaries={summaries} />}
    </PageContainer>
  );
};
