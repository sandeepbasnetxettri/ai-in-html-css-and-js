# Jarvis AI Voice Assistant

A modern, web-based AI voice assistant built with HTML, CSS, JavaScript, and Python Flask. Jarvis combines speech recognition, text-to-speech, and OpenAI's GPT-3.5 for intelligent conversations.

## Features

🎤 **Voice Recognition**: Uses Web Speech API for hands-free interaction
🔊 **Text-to-Speech**: Natural voice responses using browser's speech synthesis
🤖 **AI Integration**: Powered by OpenAI GPT-3.5-turbo for intelligent responses
💬 **Dual Input**: Voice commands or text input
📱 **Responsive Design**: Works on desktop and mobile devices
🎨 **Modern UI**: Beautiful, animated interface with real-time visual feedback
⚡ **Fallback Mode**: Works even without AI backend for basic commands

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up API Keys

Create a `.env` file in the project root:

```bash
# OpenAI API Key (Required for AI functionality)
OPENAI_API_KEY=your_actual_openai_api_key_here

# News API Key (Optional)
NEWS_API_KEY=your_news_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. Run the Application

```bash
python app.py
```

### 4. Open in Browser

Navigate to `http://localhost:5000`

## Usage

### Voice Commands

1. **Activate**: Say "Jarvis" to wake up the assistant
2. **Command**: Give your command or ask a question
3. **Response**: Jarvis will respond with voice and text

### Text Input

- Type your message in the text input field
- Press Enter or click the send button

### Keyboard Shortcuts

- `Ctrl + M`: Toggle microphone
- `Enter`: Send text message

## File Structure

```
jarvis-voice-assistant/
├── index.html          # Main HTML interface
├── style.css           # Modern CSS styling
├── script.js           # Frontend JavaScript functionality
├── app.py              # Flask backend server
├── main.py             # Original Python script (for reference)
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## API Integration

### OpenAI GPT-3.5-turbo

The assistant uses OpenAI's GPT-3.5-turbo model for intelligent responses. Make sure to:

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Set it in your `.env` file
3. Have sufficient credits in your OpenAI account

### Fallback Responses

When the AI backend is unavailable, Jarvis provides intelligent fallback responses for common commands:

- Time and date
- Greetings and farewells
- Jokes and entertainment
- Help and assistance

## Browser Compatibility

- **Chrome/Edge**: Full support for speech recognition and synthesis
- **Firefox**: Full support
- **Safari**: Limited speech recognition support
- **Mobile**: Works on modern mobile browsers

## Customization

### Voice Settings

Modify the `speak()` function in `script.js` to adjust:
- Speech rate
- Pitch
- Volume
- Voice selection

### AI Personality

Edit the system prompt in `app.py` to customize Jarvis's personality and capabilities.

### Styling

Modify `style.css` to change colors, animations, and layout.

## Troubleshooting

### Speech Recognition Issues

1. **Microphone Access**: Ensure your browser has permission to access the microphone
2. **HTTPS Required**: Some browsers require HTTPS for speech recognition
3. **Browser Support**: Check if your browser supports the Web Speech API

### AI Backend Issues

1. **API Key**: Verify your OpenAI API key is correct
2. **Credits**: Ensure you have sufficient OpenAI credits
3. **Network**: Check your internet connection

### Common Errors

- **"Speech recognition not supported"**: Update your browser or use a supported browser
- **"OpenAI API key not configured"**: Set your API key in the `.env` file
- **"Backend error"**: Check if the Flask server is running

## Development

### Adding New Features

1. **New Commands**: Add logic in `get_fallback_response()` function
2. **UI Elements**: Modify HTML and CSS files
3. **Backend Logic**: Extend the Flask app in `app.py`

### Testing

```bash
# Run with debug mode
python app.py

# Test health endpoint
curl http://localhost:5000/health
```

## Security Notes

- Never commit your `.env` file with real API keys
- Use environment variables for sensitive configuration
- Consider rate limiting for production use
- Validate and sanitize user inputs

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve Jarvis!

---

**Built with ❤️ using HTML, CSS, JavaScript, and Python**
