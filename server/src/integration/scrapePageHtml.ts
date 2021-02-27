import axios from "axios";

/**
 * Scrapes the webpage HTML
 * @param linksArray
 */
export const scrapePageHtml = async (linksArray: string[][]) => {
  console.log("scrapePageHtml");
  let rawDataArrays: string[][] = [];
  try {
    // concurrent requests => [[promise1, promise2], [promise3, promise4]]
    const rawResultsList = linksArray.map((links) => {
      return links.map((link) => axios.get(link));
    });

    // resolve all promises => [[string1, string2], [string3, string4]]
    rawDataArrays = await Promise.all(
      rawResultsList.map(async (rawResults) => {
        const rawDataList = (await Promise.all(rawResults)).map(
          (result) => result.data
        );
        return rawDataList;
      })
    );
  } catch (error) {
    console.error(error);
  }
  return rawDataArrays;
};
