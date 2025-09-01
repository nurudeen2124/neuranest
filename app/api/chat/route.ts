import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY environment variable is not set")
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const { message, history } = await req.json()

    // Build conversation context from history
    const messages = [
      {
        role: "system" as const,
        content: `You are NeuraNest, a friendly and intelligent AI assistant. You are helpful, engaging, curious, and always eager to have meaningful conversations. You should:
        - Be warm and personable in your responses
        - Show genuine interest in the user's thoughts and experiences
        - Ask follow-up questions when appropriate
        - Provide helpful and accurate information
        - Maintain a conversational and approachable tone
        - Be concise but thorough in your responses`,
      },
      ...history.map((msg: any) => ({
        role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.text,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ]

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages,
      maxTokens: 500,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return new Response(
      JSON.stringify({
        error: `Error processing chat request: ${errorMessage}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
