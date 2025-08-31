from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from openai import OpenAI
import requests
from datetime import datetime
from config import get_config, validate_config

app = Flask(__name__)
CORS(app)

# Load environment variables
try:
    load_dotenv(encoding='utf-8')
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")

# Get API keys from environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
NEWS_API_KEY = os.getenv('NEWS_API_KEY')

# Initialize OpenAI client
client = None
if OPENAI_API_KEY and OPENAI_API_KEY != 'your_openai_api_key_here':
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        print("✅ OpenAI client initialized successfully")
    except Exception as e:
        print(f"❌ OpenAI client initialization failed: {e}")
        client = None
else:
    print("⚠️  OpenAI API key not configured - running in fallback mode")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/language/<lang>')
def set_language(lang):
    """Set language preference"""
    if lang in ['en', 'ne']:
        return jsonify({'language': lang, 'message': 'Language set successfully'})
    return jsonify({'error': 'Invalid language'}), 400

@app.route('/api/nepali-commands')
def get_nepali_commands():
    """Get list of Nepali voice commands"""
    commands = {
        'greetings': ['नमस्ते', 'नमस्कार', 'hello', 'hi'],
        'time_date': ['समय', 'टाइम', 'मिति', 'दिन', 'time', 'date'],
        'jokes': ['चुट्किला', 'joke'],
        'help': ['मद्दत', 'help'],
        'farewell': ['फिर्ता मेल', 'अलविदा', 'bye', 'goodbye'],
        'weather': ['मौसम', 'weather'],
        'thanks': ['धन्यवाद', 'thank']
    }
    return jsonify(commands)

@app.route('/process_command', methods=['POST'])
def process_command():
    try:
        data = request.get_json()
        command = data.get('command', '').lower()
        
        if not command:
            return jsonify({'error': 'No command provided'}), 400
        
        # Process the command using AI
        response = ai_process(command)
        
        return jsonify({'response': response})
        
    except Exception as e:
        print(f"Error processing command: {e}")
        return jsonify({'error': str(e)}), 500

def ai_process(command):
    """Process commands using OpenAI GPT-3.5-turbo"""
    
    # Check if OpenAI is configured
    if not client:
        return "OpenAI API key not configured. Please set your API key in the environment variables."
    
    try:
        # Create system prompt for Jarvis
        system_prompt = """You are Jarvis, a virtual AI assistant skilled in general tasks like Alexa and Google Assistant. 
        You are helpful, friendly, and give concise responses. You can help with:
        - General knowledge questions
        - Task planning and organization
        - Simple calculations
        - Creative writing and brainstorming
        - Technology explanations
        - Entertainment and fun facts
        
        Keep responses under 100 words and be conversational."""
        
        # Process with OpenAI
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": command}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        response = completion.choices[0].message.content
        
        # Add some Jarvis personality
        if not response.startswith(('I', 'You', 'The', 'Here', 'Let')):
            response = f"I understand you want to know about '{command}'. {response}"
        
        return response
        
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return get_fallback_response(command)

def get_fallback_response(command):
    """Fallback responses when AI is not available"""
    
    # Detect language (simple detection)
    is_nepali = any(char in command for char in ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', '्', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ'])
    
    if is_nepali:
        return get_nepali_response(command)
    else:
        return get_english_response(command)

def get_nepali_response(command):
    """Nepali language responses"""
    
    # Time and date commands
    if any(word in command for word in ['समय', 'टाइम', 'time']):
        current_time = datetime.now().strftime("%I:%M %p")
        return f"हालको समय {current_time} हो"
    
    elif any(word in command for word in ['मिति', 'दिन', 'date']):
        current_date = datetime.now().strftime("%A, %B %d, %Y")
        return f"आज {current_date} हो"
    
    # Greeting commands
    elif any(word in command for word in ['नमस्ते', 'नमस्कार', 'hello', 'hi', 'hey']):
        return "नमस्ते! म जार्भिस हुँ, तपाईंको AI सहायक। म तपाईंलाई कसरी सहयोग गर्न सक्छु?"
    
    # Farewell commands
    elif any(word in command for word in ['फिर्ता मेल', 'अलविदा', 'bye', 'goodbye']):
        return "फिर्ता मेल! राम्रो दिन होस्। म तपाईंलाई फेरि चाहिन्छ भने यहाँ हुनेछु!"
    
    # Weather command
    elif any(word in command for word in ['मौसम', 'weather']):
        return "माफ गर्नुहोस्, म हाल मौसम जाँच गर्न सक्दिन। कृपया मौसम एप वा वेबसाइट जाँच गर्नुहोस्।"
    
    # Joke command
    elif any(word in command for word in ['चुट्किला', 'joke']):
        jokes = [
            "वैज्ञानिकहरूले किन एटमहरूलाई विश्वास गर्दैनन्? किनभने तिनीहरू सबै कुरा बनाउँछन्!",
            "कृत्रिम नूडललाई के भनिन्छ? नक्कली नूडल!",
            "बिजुली किन बल्लो छ? किनभने यो तारहरूमा यात्रा गर्छ!",
            "कम्प्युटर किन रिसाउँछ? किनभने यसको माउस छ!"
        ]
        import random
        return random.choice(jokes)
    
    # Help command
    elif any(word in command for word in ['मद्दत', 'help']):
        return "म तपाईंलाई प्रश्नहरू, चुट्किलाहरू, समय र मिति, र धेरै कुराहरूमा सहयोग गर्न सक्छु। मलाई केही पनि सोध्नुहोस्!"
    
    # Thank you
    elif any(word in command for word in ['धन्यवाद', 'thank']):
        return "तपाईंलाई स्वागत छ! म तपाईंलाई अरू केही सहयोग गर्न सक्छु?"
    
    # Default response
    else:
        return f"मले सुनें तपाईंले भने: '{command}'। म हाल फलब्याक मोडमा छु। कृपया पूर्ण AI क्षमताको लागि OpenAI API कुञ्जी कन्फिगर गर्नुहोस्।"

def get_english_response(command):
    """English language responses"""
    
    # Time and date commands
    if 'time' in command:
        current_time = datetime.now().strftime("%I:%M %p")
        return f"The current time is {current_time}"
    
    elif 'date' in command:
        current_date = datetime.now().strftime("%A, %B %d, %Y")
        return f"Today is {current_date}"
    
    # Greeting commands
    elif any(word in command for word in ['hello', 'hi', 'hey']):
        return "Hello! I'm Jarvis, your AI assistant. How can I help you today?"
    
    # Farewell commands
    elif any(word in command for word in ['bye', 'goodbye', 'see you']):
        return "Goodbye! Have a great day. I'll be here when you need me again."
    
    # Weather command
    elif 'weather' in command:
        return "I can't check the weather right now, but you can ask me about other things or check a weather app."
    
    # Joke command
    elif 'joke' in command:
        jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "What do you call a fake noodle? An impasta!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "I told my wife she was drawing her eyebrows too high. She looked surprised!",
            "Why don't eggs tell jokes? They'd crack each other up!"
        ]
        import random
        return random.choice(jokes)
    
    # Help command
    elif 'help' in command:
        return "I can help you with questions, tell jokes, give the time and date, and much more. Just ask me anything!"
    
    # Thank you
    elif 'thank' in command:
        return "You're welcome! Is there anything else I can help you with?"
    
    # Default response
    else:
        return f"I heard you say '{command}'. I'm currently in fallback mode. For full AI capabilities, please ensure your OpenAI API key is configured."

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_input = data.get('message', '')
        
        # Check backend status
        if not client:
            return jsonify({
                'status': 'fallback',
                'message': 'Running in fallback mode. Please configure OpenAI API key.',
                'timestamp': datetime.now().strftime("%I:%M %p")
            })
        
        # Process with AI
        response = ai_process(user_input)
        
        return jsonify({
            'status': 'success',
            'message': response,
            'timestamp': datetime.now().strftime("%I:%M %p")
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().strftime("%I:%M %p")
        }), 500

@app.route('/health')
def health_check():
    return {'status': 'ok'}

@app.route('/status')
def get_status():
    return jsonify({
        'status': 'active' if client else 'fallback',
        'ai_enabled': client is not None,
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

if __name__ == '__main__':
    print("🚀 Starting Jarvis AI Voice Assistant...")
    print("📱 Open your browser and go to: http://localhost:5000")
    print("🔑 Make sure to set your OpenAI API key in the .env file")
    print("🎤 Say 'Jarvis' to activate voice commands!")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
