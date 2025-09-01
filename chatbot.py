import json
import os

# Load responses from JSON file
try:
    with open("responses.json") as f:
        responses = json.load(f)
except FileNotFoundError:
    responses = {
        "hello": "Hi, I'm NeuraNest 👋. How can I help you?",
        "how are you": "I'm doing great, thanks for asking!",
        "bye": "Goodbye! 👋 Have a nice day."
    }

def get_response(user_input):
    user_input = user_input.lower().strip()
    
    # Check for exact matches first
    for key in responses:
        if key in user_input:
            return responses[key]
    
    # Optional OpenAI integration
    if os.getenv("OPENAI_API_KEY"):
        try:
            import openai
            openai.api_key = os.getenv("OPENAI_API_KEY")
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are NeuraNest, a helpful chatbot assistant."},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=150
            )
            return response['choices'][0]['message']['content']
        except Exception as e:
            print(f"OpenAI API error: {e}")
    
    return "NeuraNest: Sorry, I don't understand that yet. Try asking about something else!"
