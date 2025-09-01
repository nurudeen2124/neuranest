"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Sparkles, Zap, Brain } from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function NeuraNestChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm NeuraNest, your premium AI assistant powered by advanced language models. I can help you with complex questions, engage in deep conversations, provide detailed insights, or assist with any task you have in mind. What would you like to explore today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10) // Last 10 messages for context

      console.log("[v0] Making API request to /api/chat")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          history: conversationHistory,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = "Failed to get AI response"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.log("[v0] API error details:", errorData)
        } catch (e) {
          console.log("[v0] Could not parse error response")
        }
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      // Create bot message for streaming
      const botMessage: Message = {
        id: messages.length + 2,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      // Stream the response
      let accumulatedText = ""
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const jsonStr = line.slice(2)
              const data = JSON.parse(jsonStr)
              if (data.type === "text-delta" && data.textDelta) {
                accumulatedText += data.textDelta
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === botMessage.id ? { ...msg, text: accumulatedText } : msg)),
                )
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error getting AI response:", error)

      let errorText = "I apologize, but I'm having trouble connecting right now. "

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorText +=
          "There seems to be a network connectivity issue. Please check your internet connection and try again."
      } else if (error instanceof Error && error.message.includes("OpenAI API key")) {
        errorText +=
          "The OpenAI API key is not configured properly. Please add the OPENAI_API_KEY environment variable in your Vercel project settings."
      } else if (error instanceof Error) {
        errorText += `Error: ${error.message}`
      } else {
        errorText += "Please try again in a moment!"
      }

      const errorMessage: Message = {
        id: messages.length + 2,
        text: errorText,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                NeuraNest
              </h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span className="text-lg font-medium">Premium AI Assistant</span>
              </div>
            </div>
          </div>
          <p className="text-foreground/80 text-xl max-w-2xl mx-auto leading-relaxed">
            Experience intelligent conversations with advanced reasoning capabilities
          </p>
        </div>

        <Card className="h-[650px] flex flex-col shadow-2xl border-0 bg-card/95 backdrop-blur-sm ring-1 ring-border/50">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span>NeuraNest AI Assistant</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-sm font-medium opacity-90">AI Online</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-4 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                          : "bg-gradient-to-br from-muted to-card text-muted-foreground ring-1 ring-border/50"
                      }`}
                    >
                      {message.sender === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>

                    <div
                      className={`max-w-md lg:max-w-lg px-5 py-4 rounded-2xl shadow-sm ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-primary/20"
                          : "bg-gradient-to-br from-card to-muted text-card-foreground ring-1 ring-border/50"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
                      <p
                        className={`text-xs mt-3 ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-card text-muted-foreground ring-1 ring-border/50 flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-gradient-to-br from-card to-muted text-card-foreground px-5 py-4 rounded-2xl ring-1 ring-border/50 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-muted-foreground">NeuraNest is thinking</span>
                        <div className="flex space-x-1 ml-3">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t bg-gradient-to-r from-muted/50 to-card/50 p-6">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-input border-gray-200 focus:border-primary focus:ring-primary/20 text-base py-3 px-4 rounded-xl shadow-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-6 py-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Powered by OpenAI GPT-4 • Advanced AI reasoning and conversation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
