export async function POST(req) {
  try {
    console.log("HEREE");
    const { message } = await req.json();
    return Response.json({ reply: `You said: ${message}` });
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
