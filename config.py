"""
Configuration file for Jarvis AI Voice Assistant
Modify these settings to customize your experience
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
try:
    load_dotenv()
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    print("Using default configuration...")

# API Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '<Your OpenAI Key Here>')
NEWS_API_KEY = os.getenv('NEWS_API_KEY', '<Your News API Key Here>')

# Flask Configuration
FLASK_HOST = '0.0.0.0'
FLASK_PORT = 5000
FLASK_DEBUG = True

# AI Configuration
AI_MODEL = "gpt-3.5-turbo"
AI_MAX_TOKENS = 150
AI_TEMPERATURE = 0.7

# Voice Configuration
SPEECH_RATE = 0.9
SPEECH_PITCH = 1.0
SPEECH_VOLUME = 0.8

# UI Configuration
CONVERSATION_MAX_HEIGHT = 400  # pixels
AUTO_SCROLL = True
CLEAR_CONVERSATION_ON_START = False

# Wake Word Configuration
WAKE_WORD = "jarvis"
WAKE_WORD_RESPONSE = "Yes, I'm listening. What can I help you with?"

# Fallback Commands
FALLBACK_COMMANDS = {
    'time': 'Gives current time',
    'date': 'Gives current date',
    'hello': 'Greeting response',
    'joke': 'Tells a random joke',
    'help': 'Shows available commands',
    'weather': 'Weather information (placeholder)',
    'bye': 'Farewell response'
}

# Custom Responses
CUSTOM_RESPONSES = {
    'greeting': "Hello! I'm Jarvis, your AI voice assistant. How can I help you today?",
    'farewell': "Goodbye! Have a great day. I'll be here when you need me again.",
    'error': "Sorry, I encountered an error processing your request.",
    'listening': "I'm listening...",
    'processing': "Processing your request...",
    'not_understood': "I didn't quite catch that. Could you please repeat?"
}

# Development Settings
ENABLE_LOGGING = True
LOG_LEVEL = 'INFO'
ENABLE_CORS = True
ENABLE_HEALTH_CHECK = True

# Security Settings
RATE_LIMIT_ENABLED = False
RATE_LIMIT_REQUESTS = 100  # requests per minute
RATE_LIMIT_WINDOW = 60     # seconds

def get_config():
    """Return configuration as a dictionary"""
    return {
        'openai_api_key': OPENAI_API_KEY,
        'news_api_key': NEWS_API_KEY,
        'flask_host': FLASK_HOST,
        'flask_port': FLASK_PORT,
        'flask_debug': FLASK_DEBUG,
        'ai_model': AI_MODEL,
        'ai_max_tokens': AI_MAX_TOKENS,
        'ai_temperature': AI_TEMPERATURE,
        'speech_rate': SPEECH_RATE,
        'speech_pitch': SPEECH_PITCH,
        'speech_volume': SPEECH_VOLUME,
        'wake_word': WAKE_WORD,
        'wake_word_response': WAKE_WORD_RESPONSE,
        'fallback_commands': FALLBACK_COMMANDS,
        'custom_responses': CUSTOM_RESPONSES
    }

def validate_config():
    """Validate configuration and return any issues"""
    issues = []
    
    if OPENAI_API_KEY == '<Your OpenAI Key Here>':
        issues.append("OpenAI API key not configured")
    
    if not OPENAI_API_KEY or len(OPENAI_API_KEY) < 10:
        issues.append("Invalid OpenAI API key")
    
    if FLASK_PORT < 1 or FLASK_PORT > 65535:
        issues.append("Invalid Flask port number")
    
    return issues

if __name__ == "__main__":
    # Print configuration for debugging
    print("Jarvis Configuration:")
    print("====================")
    
    config = get_config()
    for key, value in config.items():
        if 'key' in key.lower() and value != '<Your OpenAI Key Here>':
            print(f"{key}: {'*' * len(value)}")
        else:
            print(f"{key}: {value}")
    
    print("\nConfiguration Validation:")
    print("========================")
    issues = validate_config()
    if issues:
        for issue in issues:
            print(f"⚠️  {issue}")
    else:
        print("✅ Configuration is valid")
