"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, ChevronDown, Bot, User, AlertCircle, ArrowLeft, Sparkles } from "lucide-react"
import Header from "@/components/header"
import { streamChatCompletion, models, DEFAULT_MODEL, type ChatMessage } from "@/lib/openrouter-service"

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Try to load messages from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("brainboost-chat-messages")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse saved messages:", e)
        }
      }
    }

    // Default welcome message
    return [
      {
        role: "assistant",
        content:
          "👋 Hi there! I'm your BrainBoost AI study assistant. I can help you understand concepts, summarize your notes, create study plans, and more. What would you like help with today?",
      },
    ]
  })

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamingResponse, setStreamingResponse] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("brainboost-chat-messages", JSON.stringify(messages))
    }
  }, [messages])

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingResponse])

  // Focus input on page load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)
    setStreamingResponse("")

    try {
      // Create system message
      const systemMessage =
        "You are BrainBoost, an AI study assistant that helps students learn more effectively. Keep your responses focused on educational content and study strategies. Be concise but thorough, and use examples when helpful."

      // Add all messages except the streaming one
      const messageHistory = [
        { role: "system" as const, content: systemMessage },
        ...messages.filter((m) => m.role !== "system"),
        userMessage,
      ]

      // Start streaming the response
      await streamChatCompletion(
        {
          messages: messageHistory,
          model: selectedModel,
          temperature: 0.7,
        },
        (chunk) => {
          setStreamingResponse((prev) => prev + chunk)
        },
        (fullResponse) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: fullResponse,
            },
          ])
          setStreamingResponse("")
          setIsLoading(false)
        },
      )
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setIsLoading(false)
      setStreamingResponse("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearConversation = () => {
    const welcomeMessage = {
      role: "assistant" as const,
      content: "👋 Starting a new conversation. How can I help with your studies today?",
    }
    setMessages([welcomeMessage])
    localStorage.setItem("brainboost-chat-messages", JSON.stringify([welcomeMessage]))
  }

  // Get the selected model's display name
  const selectedModelName = models.find((m) => m.id === selectedModel)?.name || "AI Model"

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 pb-6">
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/")}
              className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 flex items-center">
              <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
              UB AI Assistant
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md"
              >
                {selectedModelName}
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {isModelDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id)
                          setIsModelDropdownOpen(false)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedModel === model.id ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.provider}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={clearConversation}
              className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-200"
            >
              Clear Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 ">
          {messages.map((message, index) => (
            <div key={index} className={` flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "assistant" ? "bg-white shadow-sm text-gray-800" : "bg-blue-600 text-white"
                }`}
              >
                <div className="flex items-start mb-2">
                  <div
                    className={`rounded-full p-1 mr-2 ${message.role === "assistant" ? "bg-blue-100" : "bg-blue-500"}`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="text-sm font-medium">{message.role === "assistant" ? "AI Assistant" : "You"}</div>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}

          {/* Streaming response */}
          {streamingResponse && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-white shadow-sm text-gray-800">
                <div className="flex items-start mb-2">
                  <div className="rounded-full p-1 mr-2 bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">AI Assistant</div>
                </div>
                <div className="whitespace-pre-wrap">{streamingResponse}</div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingResponse && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-white shadow-sm text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full p-1 bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">AI Assistant</div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="rounded-lg p-3 bg-red-50 text-red-800 flex items-center max-w-[80%]">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <textarea
              ref={inputRef}
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your studies..."
              className="flex-1 p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
              hidden
            />
            <input type="text"
            //  ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your studies..."
              className="flex-1 p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
              // rows={3}
              disabled={isLoading} />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded ${
                !input.trim() || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
