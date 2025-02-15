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

      // Replace placeholders dynamically
      Object.keys(params).forEach((key) => {
        apiUrl = apiUrl.replace(`{${key}}`, params[key]);
      });

      // Append API key
      apiUrl += apiUrl.includes("?")
        ? `&apikey=${FMP_API_KEY}`
        : `?apikey=${FMP_API_KEY}`;

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
