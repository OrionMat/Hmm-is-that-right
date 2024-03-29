/** tests google searches for statement */
import axios from "axios";
import { googleSearch } from "./googleSearch";

jest.mock("axios");
jest.mock("../../logger.ts");
jest.mock("../../config/serverConfig", () => ({
  serverConfig: { serpSearchApiKey: "NOT_TELLING" },
}));

const mockAxios = axios as jest.Mocked<typeof axios>;

const statement = "Kenya win 7s";
const sources = ["fancy source", "shmancy source", "pure shmorce", "horse"];

describe("Get URLs to related articles via Google search", () => {
  test("Ideal case: axios HTTP GET requests are made with the correct parameters and URLs are correctly returned", async () => {
    // setup
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
      {
        data: {
          organic_results: [{ link: "www.sneakyWoodenHorse.com" }],
        },
      },
    ];

    // mocks
    mockAxios.get.mockResolvedValueOnce(axiosResponses[0]);
    mockAxios.get.mockRejectedValueOnce(axiosResponses[1]); // reject
    mockAxios.get.mockResolvedValueOnce(axiosResponses[2]);
    mockAxios.get.mockRejectedValueOnce(axiosResponses[3]); // reject

    // run test
    const sourceUrls = await googleSearch(statement, sources);

    // asserts: axios called with correct parameters
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
    // asserts: correct urls are returned
    expect(sourceUrls["fancy source"]).toEqual([
      "www.fancy.com/article-1",
      "www.fancy.com/article-2",
    ]);
    expect(sourceUrls?.["shmancy source"]).toBeUndefined();
    expect(sourceUrls["pure shmorce"]).toEqual([
      "www.shmorce.com/article-1",
      "www.shmorce.com/article-2",
    ]);
    expect(sourceUrls?.["horse"]).toBeUndefined();
  });

  test("Non-ideal case: No data is returned by Axios", async () => {
    // setup
    const axiosResponse: any = [];

    // mocks
    mockAxios.get.mockResolvedValueOnce(axiosResponse);

    // run test
    let dataError;
    try {
      await googleSearch(statement, sources);
    } catch (error) {
      dataError = error;
    }

    // asserts
    expect(dataError).toEqual(
      new Error(
        "Searching Google: TypeError: Cannot read properties of undefined (reading 'data')"
      )
    );
  });

  test("Non-ideal case: Axios throws an error response", async () => {
    // setup
    const axiosResponse = { status: 500 };

    // mocks
    mockAxios.get.mockImplementationOnce(() => {
      throw axiosResponse;
    });

    // run test
    let dataError;
    try {
      await googleSearch(statement, sources);
    } catch (error) {
      dataError = error;
    }

    // asserts
    expect(dataError).toEqual(new Error("Searching Google: [object Object]"));
  });
});
