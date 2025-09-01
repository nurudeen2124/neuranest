// Initialize timestamp for initial message
document.addEventListener("DOMContentLoaded", () => {
  const initialTime = document.getElementById("initial-time")
  if (initialTime) {
    initialTime.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Focus on input field
  document.getElementById("userInput").focus()

  // Add enter key listener
  document.getElementById("userInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  })
})

async function sendMessage() {
  const input = document.getElementById("userInput")
  const sendButton = document.getElementById("sendButton")
  const message = input.value.trim()

  if (!message) return

  // Disable input and button
  input.disabled = true
  sendButton.disabled = true
  sendButton.innerHTML = "<span>Sending...</span>"

  // Clear input
  input.value = ""

  // Display user message
  const chatlog = document.getElementById("chatlog")
  const userMessageDiv = document.createElement("div")
  userMessageDiv.className = "message user-message"
  userMessageDiv.innerHTML = `
        <div class="message-content">
            <strong>You:</strong> ${escapeHtml(message)}
        </div>
        <div class="timestamp">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
    `
  chatlog.appendChild(userMessageDiv)
  chatlog.scrollTop = chatlog.scrollHeight

  try {
    // Send to backend
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Display bot response
    const botMessageDiv = document.createElement("div")
    botMessageDiv.className = "message bot-message"
    botMessageDiv.innerHTML = `
            <div class="message-content">
                ${escapeHtml(data.reply)}
            </div>
            <div class="timestamp">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        `
    chatlog.appendChild(botMessageDiv)
  } catch (error) {
    console.error("Error:", error)

    // Display error message
    const errorMessageDiv = document.createElement("div")
    errorMessageDiv.className = "message bot-message"
    errorMessageDiv.innerHTML = `
            <div class="message-content">
                <strong>NeuraNest:</strong> Sorry, I'm having trouble connecting right now. Please try again in a moment.
            </div>
            <div class="timestamp">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        `
    chatlog.appendChild(errorMessageDiv)
  } finally {
    // Re-enable input and button
    input.disabled = false
    sendButton.disabled = false
    sendButton.innerHTML = "<span>Send</span>"
    input.focus()

    // Scroll to bottom
    chatlog.scrollTop = chatlog.scrollHeight
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Add some visual feedback for typing
let typingTimeout
document.getElementById("userInput").addEventListener("input", () => {
  clearTimeout(typingTimeout)
  // Could add typing indicator here if desired
})
