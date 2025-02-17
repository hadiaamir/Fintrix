import axios from "axios";

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

    // Combine all content fields into a single string for ChatGPT
    const combinedContent = objectsArray.map((obj) => obj.content).join("\n\n");

    // Call OpenAI API for summarization using the correct endpoint and request structure
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions", // Correct endpoint for GPT-3.5 or GPT-4
      {
        model: "gpt-4", // Use gpt-4 or gpt-3.5-turbo
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: `Summarize the following content:\n\n${combinedContent}`,
          },
        ],
        max_tokens: 150, // Adjust token limit as necessary
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Use environment variable for security
          "Content-Type": "application/json",
        },
      }
    );

    // Return summarized content
    const summarizedContent = response.data.choices[0].message.content.trim();
    return new Response(JSON.stringify({ summary: summarizedContent }), {
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
