import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TOKENS = 8000; // Keep some buffer to avoid exceeding limits

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

export async function POST(req) {
  try {
    // Parse JSON body from request
    const { objectsArray } = await req.json();

    if (!objectsArray || !Array.isArray(objectsArray)) {
      return new Response(
        JSON.stringify({
          error: "Invalid input. Expected an array of objects.",
        }),
        { status: 400 }
      );
    }

    // Helper function to convert object fields into a summary-friendly format
    const formatObjectForSummary = (obj) => {
      if (obj.content) {
        return obj.content; // Use content if available
      } else {
        return Object.entries(obj)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n"); // Convert key-value pairs into readable text
      }
    };

    // Combine formatted content into a single string
    const combinedContent = objectsArray
      .map(formatObjectForSummary)
      .join("\n\n");

    // Trim text if it's too long
    const trimmedContent = trimTextToTokenLimit(combinedContent, MAX_TOKENS);

    // If the content is still too large, split it into smaller chunks
    const contentChunks = splitIntoChunks(trimmedContent, 4000);

    let summaries = [];

    for (const chunk of contentChunks) {
      // Request ChatGPT to summarize each chunk separately
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a concise and efficient summarizer.",
          },
          {
            role: "user",
            content: `Summarize the following content in one short paragraph:\n\n${chunk}`,
          },
        ],
        max_tokens: 80, // Keep responses short
        temperature: 0.7,
      });

      summaries.push(response.choices[0].message.content.trim());
    }

    // Combine all summary chunks into a final summary
    const finalSummary = summaries.join(" ");

    console.log("Final Summary:", finalSummary);
    return new Response(JSON.stringify({ summary: finalSummary }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error summarizing content:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while summarizing the content.",
      }),
      { status: 500 }
    );
  }
}
