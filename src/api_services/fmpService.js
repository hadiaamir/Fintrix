import FMP_CATEGORIES from "../constants/Categories.json";

const FMP_API_KEY = process.env.FMP_API_KEY; // Ensure your key is stored in .env

const fmpService = {
  async fetchData(category, params = {}) {
    try {
      if (!category || !FMP_CATEGORIES[category]) {
        throw new Error("Invalid or missing category");
      }

      // Get API URL template
      let apiUrl = FMP_CATEGORIES[category].api;

      console.log("params", params);

      // Append remaining parameters correctly
      // Construct base URL
      const urlObj = new URL(apiUrl);

      // Replace placeholders in API URL if they exist
      Object.keys(params).forEach((key) => {
        apiUrl = apiUrl.replace(`{${key}}`, encodeURIComponent(params[key]));
      });

      // Append missing parameters correctly
      Object.entries(params).forEach(([key, value]) => {
        if (!apiUrl.includes(`{${key}}`)) {
          urlObj.searchParams.append(key, value);
        }
      });

      // Append API key
      urlObj.searchParams.append("apikey", FMP_API_KEY);

      // Convert to final URL string
      apiUrl = urlObj.toString();

      console.log("apeneded url", apiUrl);

      console.log("fetching...");

      // Fetch data
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error("API request failed: " + response.statusText);

      return await response.json();
    } catch (error) {
      console.error(`FMP API Error for category '${category}':`, error);
      return { error: error.message };
    }
  },
};

export default fmpService;
