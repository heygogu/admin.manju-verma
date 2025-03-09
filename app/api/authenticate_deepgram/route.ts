
export async function GET() {
  try {
    // Replace this with your actual Deepgram API key
    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    return Response.json({ key: apiKey });
  } catch (error) {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}