import ChatGPTService from "./ChatGPTService"; // Assuming you have this service imported already
import UtilityService from "./UtilityService";
import FMP_CATEGORIES from "../../constants/Categories.json";
import { globalState } from "@/lib/globalState";

const FMPService = {
  /**
   * Fetches data from multiple API URLs concurrently.
   *
   * @param {Array} apiUrls - An array of API URLs to fetch data from.
   * @returns {Array|null} - An array of API responses or null if an error occurs.
   */
  fetchMultipleApis: async function (apiUrls) {
    if (!apiUrls || !Array.isArray(apiUrls) || apiUrls.length === 0)
      return null;

    const apiKey = process.env.FMP_API_KEY;

    try {
      // Fetch data for each API URL
      const responses = await Promise.all(
        apiUrls.map(async (url) => {
          const finalUrl = `${url}${
            url.includes("?") ? "&" : "?"
          }apikey=${apiKey}`;

          const response = await fetch(finalUrl);
          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
          }
          return response.json();
        })
      );

      return responses; // Returns an array of API responses
    } catch (error) {
      console.error("Error fetching multiple financial data:", error);
      return null;
    }
  },

  /**
   * Fetches data from a single API URL.
   *
   * @param {string} apiUrl - The API URL to fetch data from.
   * @returns {Object|null} - The API response data or null if an error occurs.
   */
  fetchFromAPI: async function (apiUrl) {
    try {
      const apiKey = process.env.FMP_API_KEY;
      const finalUrl = `${apiUrl}${
        apiUrl.includes("?") ? "&" : "?"
      }apikey=${apiKey}`;

      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching financial data:", error);
      return null;
    }
  },

  /**
   * Determines the best matching API URL for a user query based on its category.
   *
   * @param {string} prompt - The user query to determine the best matching API.
   * @returns {Object} - The category and the API URL, or an error message if no match is found.
   */
  getBestApiUrl: async function (prompt) {
    const categoryKey = await ChatGPTService.findBestMatchingCategory(prompt);

    if (!categoryKey) return { error: "No matching category found." };

    const category = FMP_CATEGORIES[categoryKey];

    let apiUrl = category.api;
    let path = {};
    let queries = {};

    // Extract required path parameters
    if (category.path) {
      for (const param of category.path) {
        const cleanParam = param.replace("*", ""); // Remove required indicator (*)

        path[cleanParam] = await UtilityService.guessParamValue(
          cleanParam,
          prompt
        );

        // save the path data in global state
        globalState[cleanParam] = queries[cleanParam];
      }
    }

    // Extract required query parameters
    if (category.queries) {
      for (const query of category.queries) {
        const cleanQuery = query.replace("*", ""); // Remove required indicator (*)

        queries[cleanQuery] = await UtilityService.guessParamValue(
          cleanQuery,
          prompt
        );

        // save the query data in global state
        globalState[cleanQuery] = queries[cleanQuery];
      }
    }

    // Append path to API URL
    if (Object.keys(path).length > 0) {
      apiUrl += Object.values(path).join("/");
    }

    // Append queries to API URL
    if (Object.keys(queries).length > 0) {
      const queryString = new URLSearchParams(queries).toString();
      apiUrl += `?${queryString}`;
    }

    return { category: categoryKey, apiUrl };
  },
};

export default FMPService;
