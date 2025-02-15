import { NextResponse } from "next/server";
import FMP_CATEGORIES from "../../../constants/Categories.json";

import OpenAI from "openai";
import fmpService from "@/api_services/fmpService";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt, summary = true } = await req.json();

    // 1️⃣ Get AI-suggested categories & params
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a financial AI assistant. Given a user query, return the most relevant API categories and required parameters.
          Available API categories:\n\n${Object.keys(FMP_CATEGORIES).join(", ")}
          
          Extract the best 3 matching categories and the required query parameters.
          Format the response strictly as JSON:
          \`\`\`json
          {
            "categories": ["Category1", "Category2"],
            "params": { "symbol": "AAPL", "query": "Apple Inc" }
          }
          \`\`\`
          `,
        },
        { role: "user", content: prompt },
      ],
    });

    // 2️⃣ Parse the OpenAI response
    const cleanedResponse = aiResponse.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (err) {
      console.error("Failed to parse OpenAI response:", cleanedResponse);
      throw new Error("Invalid JSON format from OpenAI");
    }

    const { categories, params } = parsedResponse || {
      categories: [],
      params: {},
    };

    // 3️⃣ Fetch data for each category
    const apiResponses = await Promise.all(
      categories.map(async (category) => {
        const data = await fmpService.fetchData(category, params);
        return { category, data };
      })
    );

    // 4️⃣ Format Response: Summary or Detailed
    const formattedResponse = summary
      ? formatSummary(apiResponses)
      : formatDetailed(apiResponses);

    console.log("formattedResponse", formattedResponse);

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 📌 Helper function to create a summary response
function formatSummary(apiResponses) {
  const summary = {};

  apiResponses.forEach(({ category, data }) => {
    if (!data || data.length === 0) return;

    switch (category) {
      case "Earnings":
        summary["Earnings"] = {
          latest_quarter: data[0]?.date || "N/A",
          actual_EPS: data[0]?.eps || "N/A",
          estimated_EPS: data[0]?.estimatedEps || "N/A",
          surprise:
            data[0]?.estimatedEps && data[0]?.eps
              ? (
                  ((data[0].eps - data[0].estimatedEps) /
                    data[0].estimatedEps) *
                  100
                ).toFixed(2) + "%"
              : "N/A",
        };
        break;

      case "Company Info":
        summary["Company Info"] = {
          name: data[0]?.companyName || "N/A",
          symbol: data[0]?.symbol || "N/A",
          industry: data[0]?.industry || "N/A",
          market_cap: data[0]?.marketCap || "N/A",
          ceo: data[0]?.ceo || "N/A",
        };
        break;

      case "Sales Revenue By Segments":
        summary["Revenue By Segments"] = data.map(({ segment, revenue }) => ({
          segment: segment || "Unknown",
          revenue: revenue || "N/A",
        }));
        break;

      case "Quote":
        summary["Stock Quote"] = {
          symbol: data[0]?.symbol || "N/A",
          price: data[0]?.price || "N/A",
          change: data[0]?.change || "N/A",
          percentChange: data[0]?.changesPercentage + "%" || "N/A",
        };
        break;

      case "Financial Statements":
        summary["Financial Statements"] = {
          revenue: data[0]?.revenue || "N/A",
          netIncome: data[0]?.netIncome || "N/A",
          earningsPerShare: data[0]?.eps || "N/A",
        };
        break;

      case "Earnings Transcripts":
        summary["Earnings Transcripts"] = data.map(({ date, content }) => ({
          date: date || "Unknown",
          excerpt: content?.slice(0, 200) + "..." || "N/A",
        }));
        break;

      case "News":
        summary["Latest News"] = data.map(({ title, url, publishedDate }) => ({
          headline: title || "No title",
          link: url || "No link",
          date: publishedDate || "Unknown",
        }));
        break;

      case "SEC Filings":
        summary["SEC Filings"] = data.map(({ date, formType, link }) => ({
          date: date || "Unknown",
          form: formType || "N/A",
          link: link || "No link",
        }));
        break;

      case "Insider Trading":
        summary["Insider Trading"] = data.map(
          ({ date, insiderName, transactionType, amount }) => ({
            date: date || "Unknown",
            insider: insiderName || "N/A",
            transaction: transactionType || "N/A",
            shares: amount || "N/A",
          })
        );
        break;

      case "Market Performance":
        summary["Market Performance"] = {
          index: data[0]?.indexName || "N/A",
          change: data[0]?.change || "N/A",
          percentChange: data[0]?.changesPercentage + "%" || "N/A",
        };
        break;

      default:
        summary[category] = data.slice(0, 3); // Provide a preview for unhandled categories
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
