import { NextResponse } from "next/server";
import UtilityService from "@/services/api/UtilityService";
import FMPService from "@/services/api/FMPService";
import redisClient from "@/lib/redis"; // Make sure to import your Redis client
import { globalState } from "@/lib/globalState";
import ChatGPTService from "@/services/api/ChatGPTService";

export async function POST(req) {
  try {
    // Parse the incoming JSON request body to extract the prompt and optional summary flag
    const { prompt, summary = true } = await req.json();

    // Check if the data is already cached in Redis
    const cachedData = await redisClient.get(prompt);
    if (cachedData) {
      console.log("cachedData", cachedData);

      // Parse Redis response (since it's stored as a string)
      const parsedData = JSON.parse(cachedData);

      // If data exists in Redis, return it
      return NextResponse.json({
        key: parsedData.key, // Access after parsing
        summary: parsedData.summary,
        data: parsedData.data,
      });
    }

    // Get the best API URL and category based on the provided prompt
    const urlData = await FMPService.getBestApiUrl(prompt);
    const url = urlData.apiUrl; // The URL to query
    let resultData = null; // Placeholder for API response data

    // Check if it's not a news category and involves multiple tickers
    if (urlData.category !== "News" && UtilityService.hasMultipleTickers(url)) {
      // Split the API URL by tickers if multiple are involved
      const separatedUrls = UtilityService.splitApiUrlByTickers(url);

      // Fetch data from multiple API URLs for each ticker
      resultData = await FMPService.fetchMultipleApis(separatedUrls);
    } else {
      // Otherwise, fetch data from a single API URL
      resultData = await FMPService.fetchFromAPI(url);
    }

    let flattenedData = null; // Placeholder for processed data

    // If the category is "Dividends", extract the historical dividend data
    if (urlData.category === "Dividends") {
      flattenedData = resultData.historical;
    }

    if (urlData.category === "Financial Statements") {
      let yearFromPrompt = await UtilityService.extractYearFromPrompt(prompt);
      let quarterFromPrompt = await UtilityService.extractQuarterFromPrompt(
        prompt
      );

      console.log("YEAR -----", yearFromPrompt);
      console.log("QUARTER -----", quarterFromPrompt);

      if (globalState.period === "quarterly") {
        flattenedData = await UtilityService.getQuarterData({
          data: resultData.flat(Infinity),
          year: yearFromPrompt,
          quarter: quarterFromPrompt,
        });
      }

      // TODO: if annual then get the annual report
    } else {
      // Otherwise, flatten the response data (in case of nested arrays)
      flattenedData = resultData.flat(Infinity);
    }

    console.log("GLOBAL ------ ", globalState);
    console.log("URL ------- ", url);
    console.log("CATEGORY ------- ", urlData.category);
    console.log("DATA -------- ", flattenedData);

    let summarizedData = await ChatGPTService.summarizeContent(flattenedData);
    console.log("summarizedData", summarizedData);

    // Save the processed data to Redis using the prompt as the key
    await redisClient.set(
      prompt,
      JSON.stringify({
        key: urlData.category,
        summary: summarizedData,
        data: flattenedData,
      }),
      {
        EX: 60 * 60 * 24 * 30, // Set an expiration time of 30 days (in seconds)
      }
    );

    // Return the processed data as a JSON response
    return NextResponse.json({
      key: urlData.category,
      summary: summarizedData,
      data: flattenedData,
    });
  } catch (error) {
    // In case of an error, log it and return a 500 error response with the error message
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
