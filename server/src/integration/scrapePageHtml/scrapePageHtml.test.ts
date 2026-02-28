import axios from "axios";
import { vi } from "vitest";
import { scrapePageHtml } from "./scrapePageHtml";

vi.mock("../../logger.ts");
vi.mock("axios");

const mockAxios = vi.mocked(axios, true);

const sourceUrls = {
  bbc: ["https://www.bbc.co.uk/news/in-pictures-54118899"],
  nyt: [
    "https://www.nytimes.com/column/i-was-misinformed",
    "https://www.nytimes.com/2018/06/18/nyregion/et-doesnt-like-the-bike-path-either.html",
  ],
  reuters: [
    "https://www.reuters.com/article/us-spain-chess-queens-gambit/spanish-chess-board-sales-soar-after-queens-gambit-cameo-idUSKBN2AG0VJ",
  ],
};

const bbcWebPages = [
  `<html>
    <head>
        <title>classified</title>
    </head>
    <body>
        <h1>list of agents no one should know about</h1>
        <ol>
            <li>Chaz bond</li>
            <li>Kingsly Shackle-stick</li>
            <li>Wagstaff Shakespear</li>
        </ol>
    </body>
</html>`,
];

const nytWebPages = [
  `<html>
    <head>
        <title>classified: above all paygrades</title>
    </head>
    <body>
        <h1>list of dad jokes no one should see</h1>
        <ol>
            <li>What did the 0 say to the 8? Nice belt!</li>
            <li>Last night my wife and I watched two DVDs back to back. Luckily I was the one facing the TV.</li>
            <li>What's the advantage of living in Switzerland? Well, the flag is a big plus!</li>
        </ol>
    </body>
    </html>`,
  `<html>
    <head>
        <title>***-assified</title>
    </head>
    <body>
        <h1>***-child names</h1>
        <ol>
            <li>Boby"); DROP TABLES</li>
            <li>null</li>
            <li>undefined</li>
        </ol>
    </body>
    </html>`,
];

const reutersWebpages = [
  `
<html>
    <head>
        <title>***-assified</title>
    </head>
    <body>
        <h1>***-sonal info from notes list</h1>
        <ol>
            <li>***-9144781 is my phone number</li>
            <li>***-d nelson is my favorite pub</li>
            <li>*** personally invested in doge coin. Nous allons la Moon.</li>
        </ol>
    </body>
</html>
`,
];

describe("Scrape webpage HTML for each URL", () => {
  test("Ideal case: scrapes webpage HTML for all source links", async () => {
    // mocks
    mockAxios.get.mockResolvedValueOnce({ data: bbcWebPages[0] });
    mockAxios.get.mockResolvedValueOnce({ data: nytWebPages[0] });
    mockAxios.get.mockResolvedValueOnce({ data: nytWebPages[1] });
    mockAxios.get.mockResolvedValueOnce({ data: reutersWebpages[0] });

    // run test
    const sourcePages = await scrapePageHtml(sourceUrls);

    // asserts
    expect(mockAxios.get).toHaveBeenCalledTimes(4);
    expect(sourcePages["bbc"].webpages).toEqual(bbcWebPages);
    expect(sourcePages["nyt"].webpages).toEqual(nytWebPages);
    expect(sourcePages["reuters"].webpages).toEqual(reutersWebpages);
  });

  test("Non-ideal case: A promised webpage does not resolve", async () => {
    // mocks
    mockAxios.get.mockResolvedValueOnce({ data: bbcWebPages[0] });
    mockAxios.get.mockResolvedValueOnce({ data: nytWebPages[0] });
    mockAxios.get.mockRejectedValueOnce({ data: nytWebPages[1] }); // rejection case
    mockAxios.get.mockRejectedValueOnce({ data: reutersWebpages[0] }); // rejection case

    // run test
    const sourcePages = await scrapePageHtml(sourceUrls);

    // asserts
    expect(mockAxios.get).toHaveBeenCalledTimes(4);
    expect(sourcePages["bbc"].webpages).toEqual(bbcWebPages);
    expect(sourcePages["nyt"].webpages).toEqual([nytWebPages[0]]);
    expect(sourcePages?.["reuters"].webpages).toEqual([]);
  });
});
