import OpenAI from "openai";
import FMP_CATEGORIES from "../../constants/Categories.json";
import COMMON_TICKERS from "../../constants/CommonTickers.json";
import UtilityService from "./UtilityService";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ChatGPTService = {
  /**
   * Extracts the company name from the given prompt using OpenAI's chat model.
   *
   * @param {string} prompt - The user query that contains the company name.
   * @returns {string} - The extracted company name.
   */
  getCompanyFromPrompt: async function (prompt) {
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
    return extractedCompany;
  },

  /**
   * Extracts the relevant fiscal quarter number from the prompt.
   *
   * @param {string} prompt - The user query that contains the fiscal quarter reference.
   * @returns {string} - The fiscal quarter (1, 2, 3, or 4).
   */
  getQuarterFromPrompt: async function (prompt) {
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
    const { quarter } = UtilityService.getLatestAvailableYearAndQuarter();
    return quarter;
  },

  /**
   * Extracts the relevant year from the given prompt.
   *
   * @param {string} prompt - The user query that contains the fiscal year reference.
   * @returns {number} - The year extracted from the prompt.
   */
  getYearFromPrompt: async function (prompt) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);

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

    if (isNaN(extractedYear)) {
      extractedYear = currentYear;
    }

    if (currentQuarter === 1 && extractedYear === currentYear) {
      extractedYear = currentYear - 1;
    }

    return extractedYear;
  },

  /**
   * Extracts stock ticker symbols from the prompt using OpenAI's chat model.
   *
   * @param {string} prompt - The user query that may contain stock ticker symbols.
   * @returns {Array} - An array of stock ticker symbols.
   */
  extractStockSymbols: async function (prompt) {
    const companyName = prompt.toLowerCase().trim();
    const tickerFromMap = Object.keys(COMMON_TICKERS).find((name) =>
      name.toLowerCase().includes(companyName)
    );

    if (tickerFromMap) {
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
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
      });

      let tickers = aiResponse.choices[0].message.content.trim();

      if (tickers === "UNKNOWN" || !tickers) {
        return [];
      }

      tickers = tickers.replace(/['"]/g, "");

      return tickers
        .split(",")
        .map((ticker) => ticker.trim())
        .filter(Boolean);
    } catch (error) {
      console.error("Error extracting stock symbols:", error);
      return [];
    }
  },

  /**
   * Determines the best category for a given user prompt based on available categories.
   *
   * @param {string} prompt - The user query for which a category needs to be determined.
   * @returns {string|null} - The best matching category or null if no match is found.
   */
  findBestMatchingCategory: async function (prompt) {
    const systemMessage = `You are an AI assistant for financial API queries. Match a user prompt to the best API category.
      
      Available categories:
      ${Object.keys(FMP_CATEGORIES).join(", ")}
  
      Respond with only the category name that best matches the prompt.`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
    });

    const bestCategory = aiResponse.choices[0].message.content.trim();
    return FMP_CATEGORIES[bestCategory] ? bestCategory : null;
  },

  /**
   * Extracts the period type (Annual or Quarterly) from the given prompt using OpenAI's chat model.
   *
   * @param {string} prompt - The user query that contains the period type.
   * @returns {string} - The extracted period type (either 'annual' or 'quarterly').
   */
  getPeriodFromPrompt: async function (prompt) {
    const systemMessage = `You are a financial assistant. Extract the period type from the user query. Determine if the question refers to an annual or quarterly period.
  
    Example Inputs and Outputs:
    - "What was Tesla's revenue in Q2 2024?" → "quarterly"
    - "What was Tesla's revenue in 2024?" → "annual"
    - "Provide the quarterly performance of Apple in Q1 2023." → "quarterly"
    - "What was the full year revenue of Amazon in 2023?" → "annual"
    - "Tell me the profits of Microsoft in Q3 2023" → "quarterly"
    
    Only return 'annual' or 'quarterly', nothing else.`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
    });

    const extractedPeriod = aiResponse.choices[0].message.content.trim();
    return extractedPeriod;
  },
  summarizeContent: async function (objectsArray) {
    if (!Array.isArray(objectsArray) || objectsArray.length === 0) {
      throw new Error("Invalid input. Expected a non-empty array of objects.");
    }

    // Helper function to format data for summary
    const formatObjectForSummary = (obj) =>
      obj.content
        ? obj.content
        : Object.entries(obj)
            .map(
              ([key, value]) => `**${key}:** ${value}` // Bold the metric key for better emphasis
            )
            .join("\n");

    // Combine formatted content into a single string with double newlines for better separation
    const combinedContent = objectsArray
      .map(formatObjectForSummary)
      .join("\n\n");

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a detailed summarizer with a friendly and conversational tone. Explain the financial metrics in an engaging and easy-to-understand way, as if you’re explaining it to a non-expert, but still maintaining clarity. Use bullet points, clear sections, and make sure the information feels accessible and natural.",
          },
          {
            role: "user",
            content: `Please summarize the following content in a casual and approachable way, with bullet points and clear section titles. Here’s the info:\n\n${combinedContent}`,
          },
        ],
        temperature: 0.7,
      });

      // Extract the response and format for better readability
      let formattedResponse =
        response.choices[0]?.message?.content?.trim() || "";

      // Replace single newlines with double newlines to ensure proper spacing between sections
      formattedResponse = formattedResponse.replace(/\n+/g, "\n\n");

      return formattedResponse;
    } catch (error) {
      console.error("Error summarizing content:", error);
      return ""; // Return empty string on failure to avoid breaking response
    }
  },
};

export default ChatGPTService;
