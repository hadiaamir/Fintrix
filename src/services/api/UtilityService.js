import ChatGPTService from "./ChatGPTService";

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
   * Function to intelligently guess parameter values based on the provided prompt
   *
   * @param {string} param - The parameter to guess (e.g., 'symbol', 'year', 'quarter', etc.)
   * @param {string} prompt - The user prompt to extract the value from
   * @returns {string} - The guessed parameter value based on the prompt or a fallback value
   */
  guessParamValue: async function (param, prompt) {
    if (param === "symbol" || param === "tickers") {
      return (await ChatGPTService.extractStockSymbols(prompt)) || "AAPL"; // Extract stock symbol if possible
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
      return 10;
    }

    if (param === "cik") {
      return UtilityService.extractCIK(prompt);
    }

    return ""; // Fallback value
  },
};

export default UtilityService;
