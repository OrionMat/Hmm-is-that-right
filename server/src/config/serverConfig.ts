import dotenv from "dotenv";

dotenv.config();

interface serverConfigI {
  serpSearchApiKey: string | undefined;
}

export const serverConfig: serverConfigI = {
  serpSearchApiKey: process.env.SERP_SEARCH_API_KEY,
};
