const allSummaries = [
  {
    source: "bbc",
    url: "https://www.bbc.co.uk/news/world-1",
    title: "BBC Headline",
    date: "Thu, 17 Apr 2026 10:00:00 GMT",
    summary: ["BBC bullet one.", "BBC bullet two."],
  },
  {
    source: "nyt",
    url: "https://www.nytimes.com/2026/04/17/world/nyt-article.html",
    title: "NYT Headline",
    date: "Thu, 17 Apr 2026 11:00:00 GMT",
    summary: ["NYT bullet one."],
  },
  {
    source: "ap",
    url: "https://apnews.com/article/ap-article-1",
    title: "AP Headline",
    date: null,
    summary: ["AP bullet one."],
  },
  {
    source: "deeplearning",
    url: "https://www.deeplearning.ai/the-batch/issue-200",
    title: "DeepLearning Headline",
    date: null,
    summary: ["DeepLearning bullet one."],
  },
  {
    source: "googlenewstech",
    url: "https://news.google.com/rss/articles/google-article-1",
    title: "Google News Tech Headline",
    date: "Thu, 17 Apr 2026 12:00:00 GMT",
    summary: ["Google bullet one.", "Google bullet two."],
  },
];

export const mockGetHeadlineNewsAllSources = JSON.stringify(allSummaries);

export const mockGetHeadlineNewsGoogleOnly = JSON.stringify(
  allSummaries.filter((s) => s.source === "googlenewstech"),
);
