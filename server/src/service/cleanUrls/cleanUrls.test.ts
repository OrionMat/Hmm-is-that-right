import { cleanUrls } from "./cleanUrls";

describe("Filtering for HTTP URLs", () => {
  test("Ideal calse: Non HTTPs URLs are filtered out of the URLs list", async () => {
    // setup
    const rawSourceUrls = {
      "fancy source": [
        "not.a.link",
        "https://www.fancy.com/article-1",
        "https://www.fancy.com/article-2",
      ],
      "shmancy source": [
        "https://www.shmancy.com/article-1",
        "www.still.not.a.link",
      ],
      "pure shmorce": ["definetly.not.a.link"],
    };

    // run test
    const urls = await cleanUrls(rawSourceUrls);

    // asserts
    expect(urls).toEqual({
      "fancy source": [
        "https://www.fancy.com/article-1",
        "https://www.fancy.com/article-2",
      ],
      "shmancy source": ["https://www.shmancy.com/article-1"],
      "pure shmorce": [],
    });
  });

  test("Ideal calse: for a known source only URLs to their webpages remain", async () => {
    // setup
    const rawSourceUrls = {
      bbc: [
        "https://www.bbc.co.uk/news/in-pictures-54118899",
        "www.not.a.link.com",
        "https://www.bbc.co.uk/news/science_and_environment",
        "https://www.bbc.co.uk/news/entertainment_and_arts",
      ],
      nyt: [
        "https://www.nytimes.com/column/i-was-misinformed",
        "https://www.nytimes.com/2018/06/18/nyregion/et-doesnt-like-the-bike-path-either.html",
        "www.sneaky.trojan.horse",
      ],
      reuters: [
        "https://www.dirtbagsite.com",
        "https://www.reuters.com/article/us-spain-chess-queens-gambit/spanish-chess-board-sales-soar-after-queens-gambit-cameo-idUSKBN2AG0VJ",
      ],
    };

    // run test
    const urls = await cleanUrls(rawSourceUrls);

    // asserts
    expect(urls).toEqual({
      bbc: [
        "https://www.bbc.co.uk/news/in-pictures-54118899",
        "https://www.bbc.co.uk/news/science_and_environment",
        "https://www.bbc.co.uk/news/entertainment_and_arts",
      ],
      nyt: [
        "https://www.nytimes.com/column/i-was-misinformed",
        "https://www.nytimes.com/2018/06/18/nyregion/et-doesnt-like-the-bike-path-either.html",
      ],
      reuters: [
        "https://www.reuters.com/article/us-spain-chess-queens-gambit/spanish-chess-board-sales-soar-after-queens-gambit-cameo-idUSKBN2AG0VJ",
      ],
    });
  });

  test("Non-ideal calse: No sources are provided", async () => {
    // setup
    const rawSourceUrls = { "fancy source": [] };

    // run test
    const urls = await cleanUrls(rawSourceUrls);

    // asserts
    expect(urls).toEqual({ "fancy source": [] });
  });
});
