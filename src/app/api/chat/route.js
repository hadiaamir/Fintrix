import { NextResponse } from "next/server";
import FMP_CATEGORIES from "../../../constants/Categories.json";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt, summary = true } = await req.json();

    // 1️⃣ Get AI-suggested categories & params

    const urlData = await getBestApiUrl(prompt);
    const url = urlData.apiUrl;
    let resultData = null;

    console.log("hasMultipleTickers(urlData)", hasMultipleTickers(url));

    // if its not a news category
    if (urlData.category !== "News" && hasMultipleTickers(url)) {
      const serperatedUrls = splitApiUrlByTickers(url);

      console.log("serperatedUrls", serperatedUrls);

      resultData = await fetchMultipleApis(serperatedUrls);
    } else {
      resultData = await fetchFromAPI(urlData);
    }

    console.log("resultData", resultData);

    // // 7️⃣ Format Response: Summary or Detailed
    // const formattedResponse = summary
    //   ? formatSummary(apiResponses)
    //   : formatDetailed(apiResponses);

    // console.log("✅ Final Response:", formattedResponse);

    return NextResponse.json({});
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
  let apiUrl = category.api;
  let params = {};
  let queries = {};

  // Extract required path parameters
  if (category.params) {
    for (const param of category.params) {
      const cleanParam = param.replace("*", ""); // Remove required indicator (*)
      params[cleanParam] = await guessParamValue(cleanParam, prompt);
    }
  }

  // Extract required query parameters
  if (category.queries) {
    for (const query of category.queries) {
      const cleanQuery = query.replace("*", ""); // Remove required indicator (*)
      queries[cleanQuery] = await guessParamValue(cleanQuery, prompt);
    }
  }

  // Append path params to API URL
  if (Object.keys(params).length > 0) {
    apiUrl += Object.values(params).join("/");
  }

  // Append query params
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
  if (param === "symbol") {
    return (await extractStockSymbols(prompt)) || "AAPL"; // Extract stock symbol if possible
  }
  if (param === "year") {
    return await getYearFromPrompt(prompt);
  }
  if (param === "quarter") {
    return await getQuarterFromPrompt(prompt);
  }
  if (param === "type") {
    return "10-K"; // Default to annual SEC filing
  }
  return "default"; // Fallback value
}

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
    model: "gpt-4-turbo",
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
    model: "gpt-4-turbo",
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

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ],
  });

  const tickers = aiResponse.choices[0].message.content.trim();

  console.log("Extracted Tickers:", tickers);

  return tickers !== "UNKNOWN" ? tickers.split(",") : [];
}

// 📌 Helper function to create a summary response
function formatSummary(apiResponses) {
  const summary = {};

  apiResponses.forEach(({ category, data }) => {
    if (!data || data.length === 0) return;

    switch (category) {
      case "Earnings":
        const actualEPS = data[0]?.eps || "N/A";
        const estimatedEPS = data[0]?.estimatedEps || "N/A";
        const surprise =
          data[0]?.estimatedEps && data[0]?.eps
            ? (
                ((data[0].eps - data[0].estimatedEps) / data[0].estimatedEps) *
                100
              ).toFixed(2) + "%"
            : "N/A";

        summary["earnings"] = {
          key: "earnings",
          latest_quarter: data[0]?.date || "N/A",
          actual_EPS: actualEPS,
          estimated_EPS: estimatedEPS,
          surprise: surprise,
          summary: `For the latest quarter, the company reported an actual EPS of ${actualEPS}, compared to an estimated EPS of ${estimatedEPS}. This resulted in a surprise of ${surprise}.`,
        };
        break;

      case "Company Info":
        summary["company_info"] = {
          key: "company_info",
          name: data[0]?.companyName || "N/A",
          symbol: data[0]?.symbol || "N/A",
          industry: data[0]?.industry || "N/A",
          market_cap: data[0]?.marketCap || "N/A",
          ceo: data[0]?.ceo || "N/A",
          summary: `Company ${data[0]?.companyName} (${data[0]?.symbol}) operates in the ${data[0]?.industry} industry. The current CEO is ${data[0]?.ceo}, and the company has a market capitalization of ${data[0]?.marketCap}.`,
        };
        break;

      case "Sales Revenue By Segments":
        summary["revenue_by_segments"] = {
          key: "revenue_by_segments",
          segments: data.map(({ segment, revenue }) => ({
            segment: segment || "Unknown",
            revenue: revenue || "N/A",
          })),
          summary: `The company generates revenue from ${
            data.length > 1 ? "multiple segments" : "one segment"
          }, including ${data.map((s) => s.segment).join(", ")}.`,
        };
        break;

      case "Quote":
        summary["stock_quote"] = {
          key: "stock_quote",
          symbol: data[0]?.symbol || "N/A",
          price: data[0]?.price || "N/A",
          change: data[0]?.change || "N/A",
          percentChange: data[0]?.changesPercentage + "%" || "N/A",
          summary: `The stock price of ${data[0]?.symbol} is currently $${data[0]?.price}, with a change of ${data[0]?.change} (${data[0]?.changesPercentage}%).`,
        };
        break;

      case "Financial Statements":
        summary["financial_statements"] = {
          key: "financial_statements",
          revenue: data[0]?.revenue || "N/A",
          netIncome: data[0]?.netIncome || "N/A",
          earningsPerShare: data[0]?.eps || "N/A",
          summary: `The company's latest financial report shows revenue of ${data[0]?.revenue}, net income of ${data[0]?.netIncome}, and earnings per share (EPS) of ${data[0]?.eps}.`,
        };
        break;

      case "Earnings Transcripts":
        summary["earnings_transcripts"] = {
          key: "earnings_transcripts",
          transcripts: data.map(({ date, content }) => ({
            date: date || "Unknown",
            excerpt: content?.slice(0, 200) + "..." || "N/A",
          })),
          summary: `Recent earnings calls discussed key topics such as ${data[0]?.content?.slice(
            0,
            50
          )}...`,
        };
        break;

      case "News":
        summary["latest_news"] = {
          key: "latest_news",
          articles: data.map(({ title, url, publishedDate }) => ({
            headline: title || "No title",
            link: url || "No link",
            date: publishedDate || "Unknown",
          })),
          summary: `Recent news includes articles such as "${data[0]?.title}" published on ${data[0]?.publishedDate}.`,
        };
        break;

      case "SEC Filings":
        summary["sec_filings"] = {
          key: "sec_filings",
          filings: data.map(({ date, formType, link }) => ({
            date: date || "Unknown",
            form: formType || "N/A",
            link: link || "No link",
          })),
          summary: `Recent SEC filings include ${data[0]?.formType} on ${data[0]?.date}.`,
        };
        break;

      case "Insider Trading":
        summary["insider_trading"] = {
          key: "insider_trading",
          transactions: data.map(
            ({ date, insiderName, transactionType, amount }) => ({
              date: date || "Unknown",
              insider: insiderName || "N/A",
              transaction: transactionType || "N/A",
              shares: amount || "N/A",
            })
          ),
          summary: `Recent insider transactions include ${data[0]?.insiderName} ${data[0]?.transactionType} ${data[0]?.amount} shares on ${data[0]?.date}.`,
        };
        break;

      case "Market Performance":
        summary["market_performance"] = {
          key: "market_performance",
          index: data[0]?.indexName || "N/A",
          change: data[0]?.change || "N/A",
          percentChange: data[0]?.changesPercentage + "%" || "N/A",
          summary: `The market index ${data[0]?.indexName} changed by ${data[0]?.change} points (${data[0]?.changesPercentage}%).`,
        };
        break;

      default:
        summary[category.toLowerCase().replace(/\s+/g, "_")] = {
          key: category.toLowerCase().replace(/\s+/g, "_"),
          preview: data.slice(0, 3),
          summary: `This category (${category}) provides additional financial information.`,
        };
    }
  });

  return summary;
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
