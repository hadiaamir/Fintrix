import ChatGPTService from "./ChatGPTService";
import { globalState } from "@/lib/globalState";

const UtilityService = {
  /**
   * Splits the API URL by tickers if there are multiple tickers present.
   *
   * @param {string} apiUrl - The URL of the API to be split by tickers.
   * @returns {Array} - An array of URLs, one for each ticker.
   */
  splitApiUrlByTickers: function (apiUrl) {
    if (!apiUrl) return []; // If no URL is provided, return an empty array.

    // Extract base URL and query parameters from the full API URL
    const [baseUrl, queryString] = apiUrl.split("?");

    // Match the portion of the URL containing tickers (e.g., /AAPL,GOOG)
    const match = baseUrl.match(/\/([A-Z,]+)$/);

    // If no tickers are found, return the original URL
    if (!match || !match[1]) return [apiUrl];

    // Split the tickers into an array and map them to individual API URLs
    const tickers = match[1].split(",");
    return tickers.map(
      (ticker) =>
        `${baseUrl.replace(match[0], `/${ticker}`)}${
          queryString ? `?${queryString}` : ""
        }`
    );
  },
  /**
   * Determines whether an API URL contains multiple tickers.
   *
   * @param {string} apiUrl - The URL to check for multiple tickers.
   * @returns {boolean} - True if the URL contains multiple tickers, false otherwise.
   */
  hasMultipleTickers: function (apiUrl) {
    if (!apiUrl || typeof apiUrl !== "string") return false; // Ensure apiUrl is a valid string.

    // Regular expression to match tickers (e.g., /AAPL,GOOG or /AAPL?query=value)
    const tickerRegex = /\/([A-Z,]+)(?:\?|$)/;
    const match = apiUrl.match(tickerRegex); // Attempt to match the tickers in the URL

    // Return true if multiple tickers are present, false otherwise
    return match && match[1].includes(",");
  },
  /**
   * Extracts a CIK number (10-digit number) from the prompt.
   *
   * @param {string} prompt - The text input that may contain a CIK number.
   * @returns {string} - The extracted CIK number or an empty string if not found.
   */
  extractCIK: function (prompt) {
    // Use a regular expression to find a CIK number (a 10-digit number)
    const cikPattern = /\b\d{10}\b/;
    const match = prompt.match(cikPattern);

    // If a CIK is found, return it, else return an empty string
    return match ? match[0] : ""; // Return null if no CIK is found
  },

  /**
   * Extracts the technical indicator mentioned in the prompt.
   *
   * @param {string} prompt - The text input that may contain a technical indicator.
   * @returns {string} - The name of the technical indicator or null if not found.
   */
  getTechnicalIndicator: function (prompt) {
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
        return indicator; // Return the matching indicator
      }
    }
    return null; // Return null if no known indicator is found
  },

  /**
   * Extracts a ticker symbol or returns the full prompt as a company name query.
   * The function assumes that a ticker symbol is a sequence of 1-5 uppercase letters.
   *
   * @param {string} prompt - The text input, which may contain a ticker symbol or a company name.
   * @returns {string} - The ticker symbol if found, otherwise the full prompt as a company name.
   */
  extractQuery: function (prompt) {
    const words = prompt.split(/\s+/); // Split the prompt into words

    for (const word of words) {
      if (/^[A-Z]{1,5}$/.test(word)) {
        // If it's 1-5 uppercase letters, assume it's a ticker symbol
        return word;
      }
    }

    // If no ticker is found, return the full prompt as a company name query
    return prompt;
  },

  /**
   * Extracts the exchange name from the prompt, if it contains any of the predefined exchanges.
   * The exchanges are case-insensitive and include major global exchanges.
   *
   * @param {string} prompt - The text input, which may contain an exchange name.
   * @returns {string} - The exchange name if found, otherwise an empty string.
   */
  extractExchange: function (prompt) {
    const exchanges = [
      "NYSE", // New York Stock Exchange
      "NASDAQ", // National Association of Securities Dealers Automated Quotations
      "LSE", // London Stock Exchange
      "TSX", // Toronto Stock Exchange
      "Euronext", // European Stock Exchange
      "HKEX", // Hong Kong Exchanges and Clearing
      "SSE", // Shanghai Stock Exchange
      "ASX", // Australian Securities Exchange
      "BSE", // Bombay Stock Exchange
      "NSE", // National Stock Exchange of India
    ];

    const words = prompt.toUpperCase().split(/\s+/); // Convert prompt to uppercase and split by spaces

    for (const word of words) {
      if (exchanges.includes(word)) {
        return word; // Return the first found exchange
      }
    }

    return ""; // Return empty "" if no exchange is found
  },

  /**
   * Gets the latest available financial year and quarter.
   * It returns the previous quarter if we're in the first quarter (Q1).
   *
   * @returns {Object} - An object containing `year` and `quarter` properties.
   * - `year`: The year of the most recent available data.
   * - `quarter`: The quarter (1 to 4) of the most recent available data.
   */
  getLatestAvailableYearAndQuarter: function () {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3); // 1 to 4

    if (currentQuarter === 1) {
      // If we're in Q1, return last year's Q4
      return { year: currentYear - 1, quarter: 4 };
    }

    return { year: currentYear, quarter: currentQuarter - 1 };
  },

  /**
   * Gets the income statement for a specific quarter of a given year based on the `period` and `date` fields.
   *
   * @param {Array} data - The income statement data from the API response.
   * @param {number} year - The year for the desired quarter (e.g., 2024).
   * @param {number} quarter - The quarter number (1 for Q1, 2 for Q2, etc.).
   * @returns {Object|null} - The income statement for the specified quarter, or null if not found.
   */
  getQuarterData: function ({ data, year, quarter }) {
    // Determine the quarter period (e.g., 'Q1', 'Q2', etc.)
    const period = quarter;

    // Find the entry that matches the period and year
    const quarterData = data.find((item) => {
      const itemPeriod = item.period; // 'Q1', 'Q2', etc.
      const itemYear = item.calendarYear; // i.e. 2024

      return itemPeriod == period && itemYear == year;
    });

    // Ensure the result is an array, even if it's a single object
    return Array.isArray(quarterData) ? quarterData : [quarterData];
  },

  /**
   * Gets the income statement for a specific year.
   *
   * @param {Array} data - The income statement data from the API response.
   * @param {number} year - The year for the desired annual data (e.g., 2024).
   * @returns {Object|null} - The income statement for the specified year, or null if not found.
   */
  getAnnualData: function ({ data, year }) {
    // Find the entry that matches the year
    const annualData = data.find((item) => {
      const itemYear = item.calendarYear; // i.e. 2024

      return itemYear == year;
    });

    // Ensure the result is an array, even if it's a single object
    const result = Array.isArray(annualData) ? annualData : [annualData];

    return result;
  },

  /**
   * Extracts the year from the given prompt.
   *
   * @param {string} prompt - The user query that contains the year.
   * @returns {string|null} - The extracted year or null if no year is found.
   */
  extractYearFromPrompt: function (prompt) {
    // Regular expression to match a 4-digit year (e.g., 2024, 1999)
    const yearPattern = /\b\d{4}\b/;

    // Search for the year in the prompt
    const match = prompt.match(yearPattern);

    // If a match is found, return the year, otherwise return null
    if (match) {
      return match[0]; // Returns the first matched year
    } else {
      return null; // No year found
    }
  },

  /**
   * Extracts the quarter (Q1, Q2, Q3, Q4) from the given prompt.
   *
   * @param {string} prompt - The user query that contains the quarter information.
   * @returns {Promise<string|null>} - The extracted quarter (e.g., 'Q1', 'Q2'), or null if no quarter is found.
   */
  extractQuarterFromPrompt: async function (prompt) {
    // Define a regular expression to match the quarter format (e.g., Q1, Q2, Q3, Q4)
    const quarterPattern = /\b(Q[1-4])\b/;

    // Use the regex to search for a quarter in the prompt
    const match = prompt.match(quarterPattern);

    // If a match is found, return the quarter (e.g., 'Q1', 'Q2', etc.), otherwise return null
    if (match) {
      return match[0]; // Returns the quarter like 'Q1', 'Q2', etc.
    } else {
      return null; // No quarter found
    }
  },

  extractYearAndPeriodData: async function ({ prompt, resultData }) {
    let result = [];

    if (!globalState.hasOwnProperty("period")) {
      // If `period` is not present, fetch it from ChatGPTService
      globalState.period = await ChatGPTService.getPeriodFromPrompt(prompt);
    }

    // Extract year from prompt using regex
    let yearFromPrompt = await this.extractYearFromPrompt(prompt);

    // Fallback: Use ChatGPT if regex fails
    if (!yearFromPrompt) {
      yearFromPrompt = await ChatGPTService.getYearFromPrompt(prompt);
    }

    console.log("YEAR -----", yearFromPrompt);

    console.log("inner globalState", globalState);

    if (globalState.period === "quarterly") {
      // Extract quarter from prompt using regex
      let quarterFromPrompt = await this.extractQuarterFromPrompt(prompt);

      // Fallback: Use ChatGPT if regex fails
      if (!quarterFromPrompt) {
        quarterFromPrompt = await ChatGPTService.getQuarterFromPrompt(prompt);
      }

      console.log("QUARTER -----", quarterFromPrompt);

      result = await this.getQuarterData({
        data: resultData.flat(Infinity),
        year: yearFromPrompt,
        quarter: quarterFromPrompt,
      });
    } else if (globalState.period === "annual") {
      console.log("ANNUAL -----");

      console.log("yearFromPrompt", yearFromPrompt);

      result = await this.getAnnualData({
        data: resultData.flat(Infinity),
        year: yearFromPrompt,
      });
    }

    console.log("result -->>>>> ", result);

    return result;
  },

  /**
   * Function to intelligently guess parameter values based on the provided prompt
   *
   * @param {string} param - The parameter to guess (e.g., 'symbol', 'year', 'quarter', etc.)
   * @param {string} prompt - The user prompt to extract the value from
   * @returns {string} - The guessed parameter value based on the prompt or a fallback value
   */
  guessParamValue: async function (param, prompt) {
    if (param === "symbol" || param === "tickers") {
      return await ChatGPTService.extractStockSymbols(prompt); // Extract stock symbol if possible
    }
    if (param === "year") {
      return await ChatGPTService.getYearFromPrompt(prompt);
    }
    if (param === "quarter") {
      return await ChatGPTService.getQuarterFromPrompt(prompt);
    }
    if (param === "type") {
      return UtilityService.getTechnicalIndicator(prompt) || "10-K"; // Default to annual SEC filing
    }

    if (param === "page") {
      return "0"; // Default to 0
    }

    if (param === "limit") {
      return "10"; // Default to 0
    }

    if (param === "exchange") {
      return UtilityService.extractExchange(prompt);
    }

    if (param === "query") {
      return UtilityService.extractQuery(prompt);
    }

    if (param === "name") {
      return await ChatGPTService.getCompanyFromPrompt(prompt);
    }

    if (param === "period") {
      return await ChatGPTService.getPeriodFromPrompt(prompt);
    }

    if (param === "cik") {
      return UtilityService.extractCIK(prompt);
    }

    return ""; // Fallback value
  },
};

export default UtilityService;
