import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Extract search parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // API Category Name
    const symbol = searchParams.get("symbol") || ""; // Stock symbol (optional)
    const query = searchParams.get("query") || ""; // Search query (optional)

    // Validate the category
    if (!category || !FMP_CATEGORIES[category]) {
      return NextResponse.json(
        { error: "Invalid or missing category" },
        { status: 400 }
      );
    }

    // Get API URL template
    let apiUrl = FMP_CATEGORIES[category].api;

    // Replace placeholders dynamically
    apiUrl = apiUrl.replace("{symbol}", symbol).replace("{query}", query);

    // Fetch data from the API
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
