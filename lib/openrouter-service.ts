// OpenRouter API service for BrainBoost

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatCompletionRequest {
  messages: ChatMessage[]
  model: string
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  choices: {
    message: ChatMessage
    finish_reason: string
    index: number
  }[]
  created: number
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Available OpenRouter models
export const models = [
  { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B", provider: "Google" },

]

// Default model
export const DEFAULT_MODEL = "google/gemma-3-27b-it:free"

// Real OpenRouter API call through our secure API route
export async function chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API error: ${errorData.error || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error calling AI API:", error)
    throw error
  }
}

// Stream chat completion for real-time responses
export async function streamChatCompletion(
  request: ChatCompletionRequest,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
) {
  try {
    const response = await fetch("/api/ai/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API error: ${errorData.error || response.statusText}`)
    }

    if (!response.body) {
      throw new Error("Response body is null")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")
    let fullResponse = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n").filter((line) => line.trim() !== "" && line.trim() !== "data: [DONE]")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const jsonStr = line.slice(6) // Remove "data: " prefix
            if (jsonStr === "[DONE]") continue

            const json = JSON.parse(jsonStr)
            const content = json.choices[0]?.delta?.content || ""

            if (content) {
              onChunk(content)
              fullResponse += content
            }
          } catch (e) {
            console.error("Error parsing JSON from stream:", e)
          }
        }
      }
    }

    onComplete(fullResponse)
    return fullResponse
  } catch (error) {
    console.error("Error streaming from AI API:", error)
    throw error
  }
}
