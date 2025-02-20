import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TOKENS = 8000; // Total token limit (adjust if needed)
const CHUNK_SIZE = 4000; // Split content into manageable chunks
const SUMMARY_MAX_TOKENS = 150; // Increased token limit for better summaries

// Function to trim text to a safe token limit
function trimTextToTokenLimit(text, maxTokens) {
  return text.split(" ").slice(0, maxTokens).join(" ");
}

// Helper function to split large content into smaller chunks
function splitIntoChunks(text, chunkSize) {
  const words = text.split(" ");
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
}

async function summarizeChunk(chunk) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a detailed and thorough summarizer, providing an in-depth explanation of the content.",
        },
        {
          role: "user",
          content: `Please provide a detailed, thorough explanation of the following content:\n\n${chunk}`,
        },
      ],
      max_tokens: SUMMARY_MAX_TOKENS, // More room for a detailed explanation
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error summarizing chunk:", error);
    return ""; // Return empty string on failure to avoid breaking response
  }
}

export async function POST(req) {
  try {
    // Parse JSON body from request
    const { objectsArray } = await req.json();

    if (!Array.isArray(objectsArray) || objectsArray.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid input. Expected a non-empty array of objects.",
        }),
        { status: 400 }
      );
    }

    // Helper function to convert object fields into a summary-friendly format
    const formatObjectForSummary = (obj) =>
      obj.content
        ? obj.content
        : Object.entries(obj)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");

    // Combine formatted content into a single string
    const combinedContent = objectsArray
      .map(formatObjectForSummary)
      .join("\n\n");

    // Trim text if it's too long
    const trimmedContent = trimTextToTokenLimit(combinedContent, MAX_TOKENS);

    // Split content into manageable chunks
    const contentChunks = splitIntoChunks(trimmedContent, CHUNK_SIZE);

    // Summarize all chunks in parallel for better performance
    const summaries = await Promise.all(contentChunks.map(summarizeChunk));

    // Combine all summary chunks into a final response
    const finalSummary = summaries.filter(Boolean).join(" ");

    return new Response(JSON.stringify({ summary: finalSummary }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error summarizing content:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while summarizing the content.",
      }),
      {
        status: 500,
      }
    );
  }
}
