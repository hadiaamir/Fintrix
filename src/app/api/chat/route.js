import { NextResponse } from "next/server";
import UtilityService from "@/services/api/UtilityService";
import FMPService from "@/services/api/FMPService";

export async function POST(req) {
  try {
    // Parse the incoming JSON request body to extract the prompt and optional summary flag
    const { prompt, summary = true } = await req.json();

    // Get the best API URL and category based on the provided prompt
    const urlData = await FMPService.getBestApiUrl(prompt);

    const url = urlData.apiUrl; // The URL to query
    let resultData = null; // Placeholder for API response data

    // Check if it's not a news category and involves multiple tickers
    if (urlData.category !== "News" && UtilityService.hasMultipleTickers(url)) {
      // Split the API URL by tickers if multiple are involved
      const serperatedUrls = UtilityService.splitApiUrlByTickers(url);

      // Fetch data from multiple API URLs for each ticker
      resultData = await FMPService.fetchMultipleApis(serperatedUrls);
    } else {
      // Otherwise, fetch data from a single API URL
      resultData = await FMPService.fetchFromAPI(url);
    }

    let flattenedData = null; // Placeholder for processed data

    // If the category is "Dividends", extract the historical dividend data
    if (urlData.category === "Dividends") {
      flattenedData = resultData.historical;
    } else {
      // Otherwise, flatten the response data (in case of nested arrays)
      flattenedData = resultData.flat(Infinity);
    }

    // Return the processed data as a JSON response
    return NextResponse.json({ key: urlData.category, data: flattenedData });
  } catch (error) {
    // In case of an error, log it and return a 500 error response with the error message
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Note: didint get to adding this part. (extra)
// 📌 Helper function to create a detailed response with pagination
function formatDetailed(apiResponses, page = 1, perPage = 20) {
  return apiResponses.map(({ category, data }) => ({
    category,
    total_records: data.length,
    page,
    per_page: perPage,
    data: data.slice((page - 1) * perPage, page * perPage),
  }));
}
