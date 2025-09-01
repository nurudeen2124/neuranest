# 🧠 NeuraNest Chatbot

A modern, responsive chatbot built with Flask and vanilla JavaScript. Features rule-based responses with optional OpenAI integration for smarter conversations.

## Features

- 💬 Interactive chat interface
- 🎨 Modern, responsive design
- 🤖 Rule-based responses with JSON configuration
- 🧠 Optional OpenAI integration for AI-powered responses
- ⚡ Real-time messaging with timestamps
- 📱 Mobile-friendly design

## Quick Start

1. **Install dependencies:**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. **Run the application:**
   \`\`\`bash
   python app.py
   \`\`\`

3. **Open your browser:**
   Navigate to `http://localhost:5000`

## Configuration

### Basic Setup
The chatbot works out of the box with predefined responses in `responses.json`. You can customize these responses by editing the JSON file.

### OpenAI Integration (Optional)
To enable AI-powered responses:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com)
2. Set the environment variable:
   \`\`\`bash
   export OPENAI_API_KEY="your-api-key-here"
   \`\`\`
3. Restart the application

### Environment Variables
- `OPENAI_API_KEY` - Your OpenAI API key (optional)
- `PORT` - Port to run the application (default: 5000)

## Project Structure

\`\`\`
NeuraNest/
├── app.py              # Flask application
├── chatbot.py          # Chatbot logic
├── responses.json      # Predefined responses
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html     # Chat interface
└── static/
    ├── style.css      # Styling
    └── script.js      # Frontend logic
\`\`\`

## Customization

### Adding New Responses
Edit `responses.json` to add new rule-based responses:

\`\`\`json
{
    "your_keyword": "Your custom response here",
    "another_keyword": "Another response"
}
\`\`\`

### Styling
Modify `static/style.css` to customize the appearance. The design uses CSS Grid and Flexbox for responsive layouts.

### Advanced Features
- Add user sessions and chat history
- Implement user authentication
- Add file upload capabilities
- Connect to external APIs

## Deployment

### Local Development
\`\`\`bash
python app.py
\`\`\`

### Production Deployment
The app is configured to work with various hosting platforms:

- **Heroku**: Include a `Procfile` with `web: python app.py`
- **Railway**: Works out of the box
- **Render**: Use `python app.py` as the start command
- **DigitalOcean App Platform**: Configure with Python buildpack

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using Flask and modern web technologies.
