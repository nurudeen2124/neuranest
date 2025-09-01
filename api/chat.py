import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs
import openai

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Set CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

            # Get request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            message = data.get('message', '')
            history = data.get('history', [])
            
            # Check for OpenAI API key
            api_key = os.environ.get('OPENAI_API_KEY')
            if not api_key:
                self.wfile.write(b'0:{"type":"text-delta","textDelta":"I apologize, but the OpenAI API key is not configured. Please add the OPENAI_API_KEY environment variable to enable AI responses."}\n')
                return

            # Set up OpenAI client
            openai.api_key = api_key
            
            # Prepare conversation context
            messages = [
                {"role": "system", "content": "You are NeuraNest, an intelligent AI assistant. You are helpful, knowledgeable, and engaging. Provide thoughtful and detailed responses while maintaining a friendly conversational tone."}
            ]
            
            # Add conversation history (last 10 messages for context)
            for msg in history[-10:]:
                role = "user" if msg.get('sender') == 'user' else "assistant"
                messages.append({"role": role, "content": msg.get('text', '')})
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Make OpenAI API call with streaming
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                stream=True
            )
            
            # Stream the response
            for chunk in response:
                if 'choices' in chunk and len(chunk['choices']) > 0:
                    delta = chunk['choices'][0].get('delta', {})
                    if 'content' in delta:
                        content = delta['content']
                        # Format as expected by frontend
                        stream_data = json.dumps({"type": "text-delta", "textDelta": content})
                        self.wfile.write(f'0:{stream_data}\n'.encode('utf-8'))
                        self.wfile.flush()
            
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            error_data = json.dumps({"type": "text-delta", "textDelta": error_msg})
            self.wfile.write(f'0:{error_data}\n'.encode('utf-8'))
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
