import { describe, it, expect, vi, Mock } from "vitest";
import axios from "axios";
import { getNewsPieces } from "./getNewsPieces";
import { IsActiveNewsSources } from "../dataModel/dataModel";

vi.mock("axios");

const mockedAxios = axios as unknown as { get: Mock };

describe("getNewsPieces", () => {
  it("calls axios.get with the statement and active sources and returns data", async () => {
    const mockData = [
      {
        url: "https://example.com",
        title: "Title",
        date: null,
        body: ["a"],
        source: "bbc",
      },
    ];

    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockData });

    const sourceStates: IsActiveNewsSources = {
      bbc: true,
      nyt: false,
      ap: true,
      reuters: false,
      twitter: false,
    };

    const result = await getNewsPieces("Test statement", sourceStates);
    const callArgs = mockedAxios.get.mock.calls[0];

    expect(mockedAxios.get).toHaveBeenCalled();
    expect(callArgs[0]).toBe("http://localhost:3001/getNewsPieces");
    expect(callArgs[1]).toEqual({
      params: { statement: "Test statement", sources: ["bbc", "ap"] },
    });
    expect(result).toEqual(mockData);
  });

  it("returns fallback object when axios throws", async () => {
    mockedAxios.get = vi.fn().mockRejectedValue(new Error("network"));

    const result = await getNewsPieces("Test", {
      bbc: true,
      nyt: false,
      ap: true,
      reuters: false,
      twitter: false,
    });

    // The implementation returns an object with status:500 when there is an error
    expect(result).toHaveProperty("status", 500);
    expect(result).toHaveProperty("statusText", "Error");
  });

  it("sends empty sources array when no sources are active", async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

    const result = await getNewsPieces("No sources", {
      bbc: false,
      nyt: false,
      ap: false,
      reuters: false,
      twitter: false,
    });

    expect(mockedAxios.get).toHaveBeenCalled();
    const callArgs = mockedAxios.get.mock.calls[0];
    expect(callArgs[1]).toEqual({
      params: { statement: "No sources", sources: [] },
    });
    expect(result).toEqual([]);
  });
});
