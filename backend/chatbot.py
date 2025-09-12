import json
import os
from openai import OpenAI
from typing import List, Dict, Any
import re
import random

class NeuraNestChatbot:
    def __init__(self):
        self.responses = self.load_responses()
        self.openai_client = None
        
        api_key = os.environ.get('OPENAI_API_KEY', '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')
        if api_key:
            self.openai_client = OpenAI(api_key=api_key)
            print("✅ OpenAI API initialized with latest client")
        else:
            print("⚠️  OpenAI API key not found, using rule-based responses only")
    
    def load_responses(self) -> Dict[str, Any]:
        """Load predefined responses from JSON file"""
        try:
            with open('backend/responses.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print("⚠️  responses.json not found, using default responses")
            return self.get_default_responses()
    
    def get_default_responses(self) -> Dict[str, Any]:
        """Default responses if JSON file is not available"""
        return {
            "greetings": [
                "Hello! I'm NeuraNest, your AI assistant. How can I help you today?",
                "Hi there! Welcome to NeuraNest. What would you like to explore?",
                "Greetings! I'm here to assist you with any questions or tasks."
            ],
            "capabilities": [
                "I can help with a wide range of topics including programming, writing, analysis, and general questions.",
                "My capabilities include answering questions, helping with coding, creative writing, and problem-solving.",
                "I'm designed to assist with various tasks from technical questions to creative projects."
            ],
            "fallback": [
                "That's an interesting question! Let me think about that...",
                "I understand you're asking about that topic. Could you provide more details?",
                "That's a great question! I'd be happy to help you explore that further."
            ]
        }
    
    def get_rule_based_response(self, message: str) -> str:
        """Get response using rule-based logic"""
        message_lower = message.lower()
        
        # Greeting patterns
        greeting_patterns = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon']
        if any(pattern in message_lower for pattern in greeting_patterns):
            return random.choice(self.responses.get('greetings', ['Hello! How can I help you?']))
        
        # Capability questions
        capability_patterns = ['what can you do', 'capabilities', 'help me with', 'what are you']
        if any(pattern in message_lower for pattern in capability_patterns):
            return random.choice(self.responses.get('capabilities', ['I can help with various tasks!']))
        
        # Name questions
        if 'your name' in message_lower or 'who are you' in message_lower:
            return "I'm NeuraNest, your premium AI assistant designed to help with complex reasoning and conversations."
        
        # Default fallback
        return random.choice(self.responses.get('fallback', ['I understand. How can I assist you further?']))
    
    def get_ai_response(self, message: str, history: List[Dict]) -> str:
        """Get response using OpenAI API with enhanced ChatGPT-like behavior"""
        try:
            messages = [
                {
                    "role": "system", 
                    "content": """You are NeuraNest, an advanced AI assistant similar to ChatGPT but with enhanced reasoning capabilities. 
                    
                    Your personality:
                    - Intelligent, helpful, and genuinely curious about helping users
                    - Conversational and engaging, like talking to a knowledgeable friend
                    - Provide detailed explanations when helpful, but be concise when appropriate
                    - Ask follow-up questions when you need clarification
                    - Admit when you're uncertain and explain your reasoning process
                    
                    Your capabilities:
                    - Complex reasoning and analysis
                    - Creative problem-solving and brainstorming
                    - Code explanation and debugging
                    - Writing assistance and editing
                    - Research and information synthesis
                    - Step-by-step explanations for complex topics
                    
                    Always strive to be helpful, accurate, and engaging in your responses."""
                }
            ]
            
            # Add conversation history (last 15 messages for better context)
            for msg in history[-15:]:
                role = "user" if msg.get('sender') == 'user' else "assistant"
                messages.append({"role": role, "content": msg.get('text', '')})
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=1500,  # Increased for more detailed responses
                temperature=0.8,  # Slightly more creative
                top_p=0.95,
                frequency_penalty=0.2,  # Reduce repetition
                presence_penalty=0.3    # Encourage topic diversity
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return f"I apologize, but I'm experiencing some technical difficulties with my AI processing right now. Let me try to help you with a simpler response: {self.get_rule_based_response(message)}"

    def get_response(self, message: str, history: List[Dict] = None) -> str:
        """Main method to get chatbot response"""
        if history is None:
            history = []
        
        # Try AI response first if available
        if self.openai_client:
            return self.get_ai_response(message, history)
        else:
            # Fall back to rule-based responses
            return self.get_rule_based_response(message)
