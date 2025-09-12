from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
from chatbot import NeuraNestChatbot

app = Flask(__name__, 
            template_folder='../frontend',
            static_folder='../frontend')
CORS(app)

# Initialize chatbot
chatbot = NeuraNestChatbot()

@app.route('/')
def index():
    """Serve the main chat interface"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages with enhanced error handling"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        print(f"[NeuraNest] Received message: {message[:100]}...")
        print(f"[NeuraNest] History length: {len(history)}")
        
        # Get response from chatbot
        response = chatbot.get_response(message, history)
        
        return jsonify({
            'response': response,
            'status': 'success',
            'timestamp': str(int(os.time.time() * 1000)),  # Add timestamp
            'model': 'gpt-4' if chatbot.openai_client else 'rule-based'
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'error': 'I apologize, but I encountered an issue processing your request. Please try again.',
            'status': 'error',
            'technical_error': str(e)  # For debugging
        }), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'NeuraNest Backend'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
