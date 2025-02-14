import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    // call open ai chat completion api
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    // 1 - take the user prompt

    // 2 - link it with the best

    console.log("response", response);

    return Response.json({ data: response.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
