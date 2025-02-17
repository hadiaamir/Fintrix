import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // console.log("combinedContent", combinedContent);

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a concise and efficient summarizer.",
        },
        {
          role: "user",
          content: `Summarize the following content in one short paragraph:\n\n${combinedContent}`,
        },
      ],
      max_tokens: 80, // Limits response length for brevity
      temperature: 0.7,
    });

    // Return summarized content
    const summarizedContent = response.choices[0].message.content.trim();

    console.log("summarizedContent", summarizedContent);
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
