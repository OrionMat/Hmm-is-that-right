/** tests google searches for statement */
import axios from "axios";
import { googleSearch } from "./googleSearch";

jest.mock("axios");
jest.mock("../config/serverConfig", () => ({
  serpSearchApiKey: "NOT_TELLING",
}));

const mockAxios = axios as jest.Mocked<typeof axios>;

test("Ideal case: axios HTTP GET requests are made with the correct parameters and URLs are correctly returned", async () => {
  // setup
  const statement = "Kenya win 7s";
  const sources = ["fancy source", "shmancy source", "pure shmorce"];
  const axiosResponses = [
    {
      data: {
        organic_results: [
          { link: "www.fancy.com/article-1" },
          { link: "www.fancy.com/article-2" },
        ],
      },
    },
    {
      data: {
        organic_results: [
          { link: "www.shmancy.com/article-1" },
          { link: "www.shmancy.com/article-2" },
        ],
      },
    },
    {
      data: {
        organic_results: [
          { link: "www.shmorce.com/article-1" },
          { link: "www.shmorce.com/article-2" },
        ],
      },
    },
  ];

  // mocks
  mockAxios.get.mockResolvedValueOnce(axiosResponses[0]);
  mockAxios.get.mockResolvedValueOnce(axiosResponses[1]);
  mockAxios.get.mockResolvedValueOnce(axiosResponses[2]);

  // run test
  const sourceUrls = await googleSearch(statement, sources);

  // asserts
  expect(mockAxios.get.mock.calls[0][0]).toBe(
    "https://api.scaleserp.com/search"
  );
  expect(mockAxios.get.mock.calls[0][1]).toEqual({
    params: {
      api_key: "NOT_TELLING",
      q: "fancy source + Kenya win 7s",
    },
  });
  expect(mockAxios.get.mock.calls[1][0]).toBe(
    "https://api.scaleserp.com/search"
  );
  expect(mockAxios.get.mock.calls[1][1]).toEqual({
    params: {
      api_key: "NOT_TELLING",
      q: "shmancy source + Kenya win 7s",
    },
  });
  expect(mockAxios.get.mock.calls[2][0]).toBe(
    "https://api.scaleserp.com/search"
  );
  expect(mockAxios.get.mock.calls[2][1]).toEqual({
    params: {
      api_key: "NOT_TELLING",
      q: "pure shmorce + Kenya win 7s",
    },
  });

  expect(sourceUrls["fancy source"]).toEqual([
    "www.fancy.com/article-1",
    "www.fancy.com/article-2",
  ]);
  expect(sourceUrls["shmancy source"]).toEqual([
    "www.shmancy.com/article-1",
    "www.shmancy.com/article-2",
  ]);
  expect(sourceUrls["pure shmorce"]).toEqual([
    "www.shmorce.com/article-1",
    "www.shmorce.com/article-2",
  ]);
});
