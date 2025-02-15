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
          
          Extract up to 3 best matching categories and the required query parameters.
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

    // 2️⃣ Parse OpenAI response
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

    let { categories, params } = parsedResponse || {
      categories: [],
      params: {},
    };

    // 3️⃣ Ask ChatGPT to Extract Tickers (if query contains company/person names)
    if (!params.tickers) {
      console.log("Asking AI to extract tickers...");

      const tickerAIResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert in financial markets. Given a user query, extract relevant stock tickers if company names, CEOs, or major investors are mentioned.
            
            Respond strictly in JSON format:
            \`\`\`json
            { "tickers": ["AAPL", "MSFT"] }
            \`\`\`
            If no tickers are found, return an empty list.`,
          },
          { role: "user", content: prompt },
        ],
      });

      try {
        const cleanedTickerResponse =
          tickerAIResponse.choices[0].message.content
            .replace(/```json|```/g, "")
            .trim();
        const tickerData = JSON.parse(cleanedTickerResponse);

        if (tickerData?.tickers?.length) {
          params.tickers = tickerData.tickers.join(",");
          console.log("✅ AI Extracted Tickers:", params.tickers);
        }
      } catch (err) {
        console.error(
          "❌ Failed to parse AI ticker extraction:",
          tickerAIResponse
        );
      }
    }

    // 4️⃣ If AI fails, fallback to FMP Search API for tickers
    if (!params.tickers && params.query) {
      console.log(
        "🔍 Fetching tickers using FMP Search API for:",
        params.query
      );

      const searchResults = await fmpService.fetchData("Company Search", {
        query: params.query,
        limit: 5,
      });

      if (searchResults.length > 0) {
        params.tickers = searchResults.map((c) => c.symbol).join(",");
        console.log("✅ FMP Search Mapped Tickers:", params.tickers);
      }
    }

    // 5️⃣ Ensure News API gets the correct parameters
    if (categories.includes("News")) {
      const today = new Date();
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - 60); // Last 60 days

      params.from = params.from || fromDate.toISOString().split("T")[0];
      params.to = params.to || today.toISOString().split("T")[0];
      params.limit = params.limit || 50;
      params.page = params.page || 0;
    }

    // 6️⃣ Fetch data for each category using UPDATED params
    console.log("🚀 Fetching API with Params:", params);
    const apiResponses = await Promise.all(
      categories.map(async (category) => {
        let data = await fmpService.fetchData(category, params);

        console.log("data", data);

        // 🛠 **Filter news results manually**
        // if (category === "News" && params.query) {
        //   const keywords = params.query.split(", ").map((k) => k.toLowerCase());
        //   data = data.filter((article) =>
        //     keywords.some(
        //       (keyword) =>
        //         article.title?.toLowerCase().includes(keyword) ||
        //         article.content?.toLowerCase().includes(keyword)
        //     )
        //   );
        // }

        return { category, data };
      })
    );

    console.log("apiResponses", apiResponses);

    // 7️⃣ Format Response: Summary or Detailed
    const formattedResponse = summary
      ? formatSummary(apiResponses)
      : formatDetailed(apiResponses);

    console.log("✅ Final Response:", formattedResponse);

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("❌ API Error:", error);
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
