import { NextResponse } from "next/server";
import FMP_CATEGORIES from "../../../constants/Categories.json";
import COMMON_TICKERS from "../../../constants/CommonTickers.json";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt, summary = true } = await req.json();

    const urlData = await getBestApiUrl(prompt);

    const url = urlData.apiUrl;
    let resultData = null;

    // if its not a news category
    if (urlData.category !== "News" && hasMultipleTickers(url)) {
      const serperatedUrls = splitApiUrlByTickers(url);

      resultData = await fetchMultipleApis(serperatedUrls);
    } else {
      resultData = await fetchFromAPI(url);
    }

    let flattenedData = null;

    if (urlData.category === "Dividends") {
      flattenedData = resultData.historical;
    } else {
      flattenedData = resultData.flat(Infinity);
    }

    return NextResponse.json({ key: urlData.category, data: flattenedData });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function splitApiUrlByTickers(apiUrl) {
  if (!apiUrl) return [];

  // Extract base URL and query parameters
  const [baseUrl, queryString] = apiUrl.split("?");
  const match = baseUrl.match(/\/([A-Z,]+)$/); // Extract tickers at the end

  if (!match || !match[1]) return [apiUrl]; // Return original URL if no tickers found

  const tickers = match[1].split(","); // Split tickers into an array
  return tickers.map(
    (ticker) =>
      `${baseUrl.replace(match[0], `/${ticker}`)}${
        queryString ? `?${queryString}` : ""
      }`
  );
}

async function fetchMultipleApis(apiUrls) {
  if (!apiUrls || !Array.isArray(apiUrls) || apiUrls.length === 0) return null;

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
}

function hasMultipleTickers(apiUrl) {
  if (!apiUrl || typeof apiUrl !== "string") return false;

  const tickerRegex = /\/([A-Z,]+)(?:\?|$)/; // Matches tickers in the URL
  const match = apiUrl.match(tickerRegex);

  return match && match[1].includes(",");
}

async function fetchFromAPI(apiUrl) {
  try {
    // Append API key (replace YOUR_API_KEY with your actual key)
    const apiKey = process.env.FMP_API_KEY;
    const finalUrl = `${apiUrl}${
      apiUrl.includes("?") ? "&" : "?"
    }apikey=${apiKey}`;

    console.log("finalUrl", finalUrl);

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
}

async function getBestApiUrl(prompt) {
  const categoryKey = await findBestMatchingCategory(prompt);

  if (!categoryKey) return { error: "No matching category found." };

  const category = FMP_CATEGORIES[categoryKey];

  console.log("category", category);

  let apiUrl = category.api;
  let path = {};
  let queries = {};

  // Extract required path parameters
  if (category.path) {
    for (const param of category.path) {
      const cleanParam = param.replace("*", ""); // Remove required indicator (*)

      console.log("cleanParam", cleanParam);

      path[cleanParam] = await guessParamValue(cleanParam, prompt);
    }
  }

  // Extract required query parameters
  if (category.queries) {
    for (const query of category.queries) {
      const cleanQuery = query.replace("*", ""); // Remove required indicator (*)
      queries[cleanQuery] = await guessParamValue(cleanQuery, prompt);
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
}

// Function to determine the best category using OpenAI for better matching
async function findBestMatchingCategory(prompt) {
  const systemMessage = `You are an AI assistant for financial API queries. Match a user prompt to the best API category.
  
  Available categories:
  ${Object.keys(FMP_CATEGORIES).join(", ")}

  Respond with only the category name that best matches the prompt.`;

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ],
  });

  const bestCategory = aiResponse.choices[0].message.content.trim();
  return FMP_CATEGORIES[bestCategory] ? bestCategory : null;
}

// Function to intelligently guess parameter values
async function guessParamValue(param, prompt) {
  console.log("param --->", param);

  if (param === "symbol" || param === "tickers") {
    return (await extractStockSymbols(prompt)) || "AAPL"; // Extract stock symbol if possible
  }
  if (param === "year") {
    return await getYearFromPrompt(prompt);
  }
  if (param === "quarter") {
    return await getQuarterFromPrompt(prompt);
  }
  if (param === "type") {
    return getTechnicalIndicator(prompt) || "10-K"; // Default to annual SEC filing
  }

  if (param === "page") {
    return "0"; // Default to 0
  }

  if (param === "limit") {
    return "10"; // Default to 0
  }

  if (param === "exchange") {
    return extractExchange(prompt);
  }

  if (param === "query") {
    return extractQuery(prompt);
  }

  if (param === "name") {
    return await getCompanyFromPrompt(prompt);
  }

  if (param === "period") {
    return 10;
  }

  if (param === "cik") {
    return extractCIK(prompt);
  }

  return ""; // Fallback value
}

function extractCIK(prompt) {
  // Use a regular expression to find a CIK number (a 10-digit number)
  const cikPattern = /\b\d{10}\b/;
  const match = prompt.match(cikPattern);

  // If a CIK is found, return it, else return null
  if (match) {
    return match[0];
  }

  return ""; // Return null if no CIK is found
}

function getTechnicalIndicator(prompt) {
  const indicators = [
    "SMA",
    "EMA",
    "MACD",
    "RSI",
    "Bollinger Bands",
    "ADX",
    "Stochastic",
    "Fibonacci",
    "ATR",
    "Ichimoku",
  ];
  const promptUpper = prompt.toUpperCase();

  for (let indicator of indicators) {
    if (promptUpper.includes(indicator)) {
      return indicator;
    }
  }
  return null; // Return null if no known indicator is found
}

async function getCompanyFromPrompt(prompt) {
  const systemMessage = `You are a financial assistant. Extract the company name from the user query.
  
  Example Inputs and Outputs:
  - "Mergers & Acquisitions Syros" → "Syros"
  - "Earnings report for Tesla" → "Tesla"
  - "Price target updates for Microsoft" → "Microsoft"
  - "Latest SEC filings for Apple Inc." → "Apple Inc."
  - "Give me the IPO details of Rivian Automotive" → "Rivian Automotive"
  
  Only return the company name, nothing else.`;

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ],
  });

  const extractedCompany = aiResponse.choices[0].message.content.trim();

  console.log("Extracted Company:", extractedCompany);

  return extractedCompany;
}

const extractQuery = (prompt) => {
  const words = prompt.split(/\s+/); // Split the prompt into words

  for (const word of words) {
    if (/^[A-Z]{1,5}$/.test(word)) {
      // If it's 1-5 uppercase letters, assume it's a ticker symbol
      return word;
    }
  }

  // If no ticker is found, return the full prompt as a company name query
  return prompt;
};

const extractExchange = (prompt) => {
  const exchanges = [
    "NYSE",
    "NASDAQ",
    "LSE",
    "TSX",
    "Euronext",
    "HKEX",
    "SSE",
    "ASX",
    "BSE",
    "NSE",
  ];

  const words = prompt.toUpperCase().split(/\s+/); // Convert prompt to uppercase and split by spaces

  for (const word of words) {
    if (exchanges.includes(word)) {
      return word; // Return the first found exchange
    }
  }

  return ""; // Return empty "" if no exchange is found
};

function getLatestAvailableYearAndQuarter() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3); // 1 to 4

  if (currentQuarter === 1) {
    // If we're in Q1, return last year's Q4
    return { year: currentYear - 1, quarter: 4 };
  }

  return { year: currentYear, quarter: currentQuarter - 1 };
}

async function getQuarterFromPrompt(prompt) {
  const systemMessage = `You are a financial assistant. Determine the most relevant fiscal quarter based on the user query. 
  If no specific quarter is mentioned, return the most recent **completed** quarter.
  
  Example Inputs and Outputs:
  - "Get Tesla's Q3 earnings" → "3"
  - "Show me Apple's Q1 report" → "1"
  - "Latest earnings report for Microsoft" → "1" (Most recent completed quarter)
  - "Past earnings call of Amazon" → "4" (Most recent completed quarter)
  
  Only return the quarter number (1, 2, 3, or 4), nothing else.`;

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ],
  });

  const extractedQuarter = aiResponse.choices[0].message.content.trim();

  console.log("Extracted Quarter:", extractedQuarter);

  if (/^[1-4]$/.test(extractedQuarter)) {
    return extractedQuarter;
  }

  // If ChatGPT didn't find a quarter, use the latest available one
  const { quarter } = getLatestAvailableYearAndQuarter();
  return quarter;
}

async function getYearFromPrompt(prompt) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);

  // Call ChatGPT to extract a year from the prompt
  const systemMessage = `You are a financial assistant. Extract the most relevant year from the user query.
  - If the query mentions a specific year, return that year.
  - If the query says "last year," return ${currentYear - 1}.
  - If no year is mentioned OR the query says "latest" or "recent," return ${currentYear}.
  
  Example Inputs and Outputs:
  - "Get Tesla's 2021 earnings" → "2021"
  - "Show me Apple's earnings for last year" → "${currentYear - 1}"
  - "Recent earnings call for Microsoft" → "${currentYear}"
  - "What was Amazon's 2020 earnings?" → "2020"
  
  Only return the year as a four-digit number, nothing else.`;

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ],
  });

  let extractedYear = parseInt(
    aiResponse.choices[0].message.content.trim(),
    10
  );

  // If no valid year was extracted, default to current year
  if (isNaN(extractedYear)) {
    extractedYear = currentYear;
  }

  // ✅ Adjust for the latest available earnings
  // If it's Q1, the latest available earnings are from Q4 of the previous year
  if (currentQuarter === 1 && extractedYear === currentYear) {
    extractedYear = currentYear - 1;
  }

  console.log("Determined Year:", extractedYear);
  return extractedYear;
}

// Function to extract stock ticker using OpenAI
async function extractStockSymbols(prompt) {
  // Check if the company name exists in the COMMON_TICKERS map first
  const companyName = prompt.toLowerCase().trim();
  const tickerFromMap = Object.keys(COMMON_TICKERS).find((name) =>
    name.toLowerCase().includes(companyName)
  );

  if (tickerFromMap) {
    // Return ticker from map if found
    return [COMMON_TICKERS[tickerFromMap]];
  }

  const systemMessage = `You are a financial assistant. Given a user query, determine the most relevant stock ticker(s). 
  Think beyond direct mentions—consider CEO names, company names, and industries. Return only the most relevant tickers, separated by commas.

  Examples:
  - "What are Mark Zuckerberg's and Satya Nadella's recent comments about AI?" → "META,MSFT"
  - "Show me Tesla's stock price" → "TSLA"
  - "Get Apple's earnings transcript" → "AAPL"
  - "Latest news on Microsoft and Nvidia" → "MSFT,NVDA"
  - "What is Amazon's valuation?" → "AMZN"
  - "How is Google's cloud business doing?" → "GOOGL"

  Always return only tickers in uppercase, separated by commas. If no ticker is relevant, return "UNKNOWN".`;

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
    });

    let tickers = aiResponse.choices[0].message.content.trim();

    // If "UNKNOWN" is returned, handle that case by returning an empty array
    if (tickers === "UNKNOWN" || !tickers) {
      return [];
    }

    // Remove any quotation marks from the tickers
    tickers = tickers.replace(/['"]/g, "");

    // Split tickers by commas and return them as an array
    return tickers
      .split(",")
      .map((ticker) => ticker.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error extracting stock symbols:", error);
    return [];
  }
}

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
