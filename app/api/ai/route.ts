import { type NextRequest, NextResponse } from "next/server"

// Set a longer timeout for AI requests
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { messages, model, temperature, max_tokens } = await req.json()

    // Validate required fields
    if (!messages || !model) {
      return NextResponse.json({ error: "Missing required fields: messages and model are required" }, { status: 400 })
    }

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": req.headers.get("referer") || "https://brainboost.app",
        "X-Title": "BrainBoost AI Study Assistant",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error?.message || response.statusText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in AI route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
