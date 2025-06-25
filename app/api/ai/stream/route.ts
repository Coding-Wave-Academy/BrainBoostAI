import type { NextRequest } from "next/server"

// Set a longer timeout for AI streaming requests
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { messages, model, temperature, max_tokens } = await req.json()

    // Validate required fields
    if (!messages || !model) {
      return new Response(JSON.stringify({ error: "Missing required fields: messages and model are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Call OpenRouter API with streaming enabled
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
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return new Response(JSON.stringify({ error: errorData.error?.message || response.statusText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Return the streaming response directly
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in AI streaming route:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unknown error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
