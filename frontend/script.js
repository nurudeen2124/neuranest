class NeuraNestChat {
  constructor() {
    this.messages = []
    this.isLoading = false
    this.initializeElements()
    this.setupEventListeners()
    this.setInitialTime()
    this.enableInput()
  }

  initializeElements() {
    this.chatMessages = document.getElementById("chatMessages")
    this.messageInput = document.getElementById("messageInput")
    this.sendButton = document.getElementById("sendButton")
    this.loadingIndicator = document.getElementById("loadingIndicator")
  }

  setupEventListeners() {
    this.sendButton.addEventListener("click", () => this.handleSendMessage())
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.handleSendMessage()
      }
    })

    this.messageInput.addEventListener("input", () => {
      this.updateSendButton()
    })
  }

  setInitialTime() {
    const initialTimeElement = document.getElementById("initialTime")
    if (initialTimeElement) {
      initialTimeElement.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  enableInput() {
    this.messageInput.disabled = false
    this.sendButton.disabled = false
    this.updateSendButton()
  }

  updateSendButton() {
    const hasText = this.messageInput.value.trim().length > 0
    this.sendButton.disabled = this.isLoading || !hasText
  }

  async handleSendMessage() {
    const message = this.messageInput.value.trim()
    if (!message || this.isLoading) return

    // Add user message
    this.addMessage(message, "user")
    this.messageInput.value = ""
    this.updateSendButton()

    // Show loading
    this.setLoading(true)

    try {
      const history = this.messages.slice(-20).map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
      }))

      console.log("[NeuraNest] Sending message to backend:", message)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          history: history,
        }),
      })

      console.log("[NeuraNest] Backend response status:", response.status)

      if (!response.ok) {
        let errorMessage = "I'm having trouble processing your request right now"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.log("[NeuraNest] Backend error:", errorData)
        } catch (e) {
          console.log("[NeuraNest] Could not parse error response")
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("[NeuraNest] Backend response data:", data)

      if (data.status === "success" && data.response) {
        this.addMessageWithTypingEffect(data.response, "bot")
      } else {
        throw new Error(data.error || "Invalid response format")
      }
    } catch (error) {
      console.error("[NeuraNest] Error:", error)

      let errorText = "I apologize for the inconvenience. "

      if (error.message.includes("fetch") || error.message.includes("network")) {
        errorText += "It seems there's a connectivity issue. Please check your internet connection and try again."
      } else if (error.message.includes("OpenAI") || error.message.includes("API")) {
        errorText += "My AI capabilities are temporarily limited, but I'm still here to help with what I can."
      } else {
        errorText += "I encountered an unexpected issue. Could you please try rephrasing your question?"
      }

      this.addMessage(errorText, "bot")
    } finally {
      this.setLoading(false)
    }
  }

  addMessage(text, sender) {
    const messageId = this.messages.length + 1
    const timestamp = new Date()

    const message = {
      id: messageId,
      text: text,
      sender: sender,
      timestamp: timestamp,
    }

    this.messages.push(message)
    this.renderMessage(message)
    this.scrollToBottom()
  }

  renderMessage(message) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${message.sender}-message`

    const avatarIcon = message.sender === "user" ? "fas fa-user" : "fas fa-robot"
    const timeString = message.timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

    messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <p>${this.escapeHtml(message.text)}</p>
                <span class="message-time">${timeString}</span>
            </div>
        `

    this.chatMessages.appendChild(messageDiv)
  }

  setLoading(loading) {
    this.isLoading = loading
    this.loadingIndicator.style.display = loading ? "block" : "none"
    this.updateSendButton()

    if (loading) {
      this.scrollToBottom()
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight
    }, 100)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  addMessageWithTypingEffect(text, sender) {
    const messageId = this.messages.length + 1
    const timestamp = new Date()

    const message = {
      id: messageId,
      text: text,
      sender: sender,
      timestamp: timestamp,
    }

    this.messages.push(message)

    // Create message element
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${sender}-message`

    const avatarIcon = sender === "user" ? "fas fa-user" : "fas fa-robot"
    const timeString = timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="${avatarIcon}"></i>
      </div>
      <div class="message-content">
        <p class="typing-text"></p>
        <span class="message-time">${timeString}</span>
      </div>
    `

    this.chatMessages.appendChild(messageDiv)

    // Animate typing effect
    const textElement = messageDiv.querySelector(".typing-text")
    this.typeText(textElement, text, 30) // 30ms delay between characters
    this.scrollToBottom()
  }

  typeText(element, text, delay = 30) {
    let index = 0
    const timer = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index)
        index++
        this.scrollToBottom()
      } else {
        clearInterval(timer)
      }
    }, delay)
  }
}

// Initialize the chat when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("[NeuraNest] Initializing chat interface...")
  new NeuraNestChat()
})
