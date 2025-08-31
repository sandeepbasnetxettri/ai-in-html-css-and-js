class JarvisAssistant {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLanguage = 'en'; // Default language
        this.conversationLog = document.getElementById('conversationLog');
        this.micButton = document.getElementById('micButton');
        this.micIcon = document.getElementById('micIcon');
        this.statusText = document.getElementById('statusText');
        this.waveContainer = document.getElementById('waveContainer');
        this.textInput = document.getElementById('textInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.languageButtons = document.querySelectorAll('.lang-btn');
        
        this.initializeSpeechRecognition();
        this.bindEvents();
        this.updateLanguageUI();
        this.speak(this.getWelcomeMessage());
        this.initializeDateTime();
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.getLanguageCode();
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateUI();
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                this.handleSpeechInput(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateUI();
                this.addMessage(this.getErrorMessage(event.error), 'jarvis');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateUI();
            };
        } else {
            this.statusText.textContent = this.getText('speech_not_supported');
            this.micButton.style.display = 'none';
        }
    }

    bindEvents() {
        this.micButton.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });

        this.sendBtn.addEventListener('click', () => {
            const text = this.textInput.value.trim();
            if (text) {
                this.processTextInput(text);
                this.textInput.value = '';
            }
        });

        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = this.textInput.value.trim();
                if (text) {
                    this.processTextInput(text);
                    this.textInput.value = '';
                }
            }
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearConversation();
        });

        // Language switching
        this.languageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchLanguage(btn.dataset.lang);
            });
        });

        // Keyboard shortcut for microphone
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                if (this.isListening) {
                    this.stopListening();
                } else {
                    this.startListening();
                }
            }
        });
    }

    startListening() {
        if (this.recognition) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    updateUI() {
        if (this.isListening) {
            this.micButton.classList.add('active');
            this.micIcon.className = 'fas fa-stop';
            this.statusText.textContent = this.getText('listening');
            this.waveContainer.classList.add('active');
        } else {
            this.micButton.classList.remove('active');
            this.micIcon.className = 'fas fa-microphone';
            this.statusText.textContent = this.getText('click_to_activate');
            this.waveContainer.classList.remove('active');
        }
    }

    handleSpeechInput(transcript) {
        this.addMessage(transcript, 'user');
        
        if (transcript.includes('jarvis') || transcript.includes('जार्भिस')) {
            const response = this.getText('listening');
            this.speak(response);
            this.addMessage(response, 'jarvis');
            
            // Start listening for command
            setTimeout(() => {
                this.startListening();
            }, 1000);
        } else {
            this.processCommand(transcript);
        }
    }

    processTextInput(text) {
        this.addMessage(text, 'user');
        this.processCommand(text);
    }

    async processCommand(command) {
        try {
            this.statusText.textContent = this.getText('processing');
            
            // Call the Python backend
            const response = await this.callAIBackend(command);
            
            this.addMessage(response, 'jarvis');
            this.speak(response);
            
        } catch (error) {
            console.error('Error processing command:', error);
            const errorMessage = this.getText('error_processing');
            this.addMessage(errorMessage, 'jarvis');
            this.speak(errorMessage);
        } finally {
            this.statusText.textContent = this.getText('click_to_activate');
        }
    }

    async callAIBackend(command) {
        try {
            const response = await fetch('/process_command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command: command })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Backend error:', error);
            // Fallback to a simple response if backend is not available
            return this.getFallbackResponse(command);
        }
    }

    getFallbackResponse(command) {
        const lowerCommand = command.toLowerCase();
        
        if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('नमस्ते')) {
            return this.currentLanguage === 'ne' ? 
                "नमस्ते! म आज तपाईंलाई कसरी सहयोग गर्न सक्छु?" : 
                "Hello! How can I assist you today?";
        } else if (lowerCommand.includes('time') || lowerCommand.includes('समय') || lowerCommand.includes('कति बज्यो') || lowerCommand.includes('what time')) {
            const now = new Date();
            const time = now.toLocaleTimeString(this.currentLanguage === 'ne' ? 'ne-NP' : 'en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            return this.currentLanguage === 'ne' ? 
                `हालको समय ${time} हो` : 
                `The current time is ${time}`;
        } else if (lowerCommand.includes('date') || lowerCommand.includes('मिति')) {
            const now = new Date();
            if (this.currentLanguage === 'ne') {
                const nepaliDate = this.formatNepaliDate(now);
                const time = now.toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' });
                return `आज ${nepaliDate} हो। हालको समय ${time} हो।`;
            } else {
                const date = now.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return `Today is ${date}. The current time is ${time}.`;
            }
        } else if (lowerCommand.includes('weather') || lowerCommand.includes('मौसम')) {
            return this.currentLanguage === 'ne' ? 
                "माफ गर्नुहोस्, म हाल मौसम जाँच गर्न सक्दिन। कृपया मौसम एप वा वेबसाइट जाँच गर्नुहोस्।" : 
                "I'm sorry, I can't check the weather right now. Please check a weather app or website.";
        } else if (lowerCommand.includes('joke') || lowerCommand.includes('चुट्किला')) {
            if (this.currentLanguage === 'ne') {
                const jokes = [
                    "वैज्ञानिकहरूले किन एटमहरूलाई विश्वास गर्दैनन्? किनभने तिनीहरू सबै कुरा बनाउँछन्!",
                    "कृत्रिम नूडललाई के भनिन्छ? नक्कली नूडल!",
                    "बिजुली किन बल्लो छ? किनभने यो तारहरूमा यात्रा गर्छ!",
                    "कम्प्युटर किन रिसाउँछ? किनभने यसको माउस छ!"
                ];
                return jokes[Math.floor(Math.random() * jokes.length)];
            } else {
                return "Why don't scientists trust atoms? Because they make up everything!";
            }
        } else if (lowerCommand.includes('thank') || lowerCommand.includes('धन्यवाद')) {
            return this.currentLanguage === 'ne' ? 
                "तपाईंलाई स्वागत छ! म तपाईंलाई अरू केही सहयोग गर्न सक्छु?" : 
                "You're welcome! Is there anything else I can help you with?";
        } else if (lowerCommand.includes('bye') || lowerCommand.includes('goodbye') || lowerCommand.includes('फिर्ता मेल')) {
            return this.currentLanguage === 'ne' ? 
                "फिर्ता मेल! राम्रो दिन होस्। म तपाईंलाई फेरि चाहिन्छ भने यहाँ हुनेछु!" : 
                "Goodbye! Have a great day!";
        } else {
            return this.getText('fallback_mode').replace('{command}', command);
        }
    }

    speak(text) {
        if (this.synthesis) {
            // Stop any ongoing speech
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            // Set language for speech synthesis
            utterance.lang = this.getLanguageCode();
            
            // Try to find appropriate voice for the language
            const voices = this.synthesis.getVoices();
            let selectedVoice = null;
            
            if (this.currentLanguage === 'ne') {
                // Try to find Nepali voice first, then Hindi, then any Indian voice
                selectedVoice = voices.find(voice => 
                    voice.lang.startsWith('ne') || 
                    voice.lang.startsWith('hi') || 
                    voice.name.toLowerCase().includes('indian') ||
                    voice.name.toLowerCase().includes('hindi')
                );
            } else {
                // Try to use a male voice for English
                selectedVoice = voices.find(voice => 
                    voice.name.includes('Male') || 
                    voice.name.includes('male')
                );
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            this.synthesis.speak(utterance);
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.conversationLog.appendChild(messageDiv);
        
        // Scroll to bottom
        this.conversationLog.scrollTop = this.conversationLog.scrollHeight;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    clearConversation() {
        this.conversationLog.innerHTML = `
            <div class="message jarvis-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.getText('conversation_cleared')}</div>
                    <div class="message-time">${this.getText('just_now')}</div>
                </div>
            </div>
        `;
    }

    // Language-specific methods
    switchLanguage(lang) {
        this.currentLanguage = lang;
        this.updateLanguageUI();
        this.updateSpeechRecognition();
        this.updatePlaceholders();
        
        // Clear conversation and show welcome message in new language
        this.clearConversation();
        this.addMessage(this.getWelcomeMessage(), 'jarvis');
        this.speak(this.getWelcomeMessage());
    }

    updateLanguageUI() {
        this.languageButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
    }

    updateSpeechRecognition() {
        if (this.recognition) {
            this.recognition.lang = this.getLanguageCode();
        }
    }

    updatePlaceholders() {
        this.textInput.placeholder = this.getText('text_input_placeholder');
        this.statusText.textContent = this.getText('click_to_activate');
    }

    getLanguageCode() {
        return this.currentLanguage === 'ne' ? 'ne-NP' : 'en-US';
    }

    getText(key) {
        const texts = {
            // English
            en: {
                welcome: "Hello! I'm Jarvis, your AI voice assistant. Say 'Jarvis' to activate me, then give me a command.",
                listening: "Yes, I'm listening. What can I help you with?",
                click_to_activate: "Click to activate Jarvis",
                speech_not_supported: "Speech recognition not supported",
                conversation_cleared: "Conversation cleared. How can I help you?",
                just_now: "Just now",
                text_input_placeholder: "Or type your command here...",
                error_prefix: "Error: ",
                processing: "Processing...",
                error_processing: "Sorry, I encountered an error processing your request.",
                fallback_mode: "I understand you said: '{command}'. I'm currently in fallback mode. Please ensure the Python backend is running for full AI capabilities."
            },
            // Nepali
            ne: {
                welcome: "नमस्ते! म जार्भिस हुँ, तपाईंको AI भ्वाइस सहायक। मलाई सक्रिय गर्न 'जार्भिस' भन्नुहोस्, त्यसपछि मलाई आदेश दिनुहोस्।",
                listening: "हो, म सुनिरहेको छु। म तपाईंलाई कसरी सहयोग गर्न सक्छु?",
                click_to_activate: "जार्भिस सक्रिय गर्न क्लिक गर्नुहोस्",
                speech_not_supported: "भाषण पहिचान समर्थित छैन",
                conversation_cleared: "कुराकानी सफा गरियो। म तपाईंलाई कसरी सहयोग गर्न सक्छु?",
                just_now: "अहिले नै",
                text_input_placeholder: "वा यहाँ आफ्नो आदेश टाइप गर्नुहोस्...",
                error_prefix: "त्रुटि: ",
                processing: "प्रक्रिया गर्दै...",
                error_processing: "माफ गर्नुहोस्, म तपाईंको अनुरोध प्रक्रिया गर्दै त्रुटि भेटियो।",
                fallback_mode: "मले बुझेँ तपाईंले भने: '{command}'। म हाल फलब्याक मोडमा छु। कृपया पूर्ण AI क्षमताको लागि Python ब्याकएन्ड चलिरहेको छ भनेर सुनिश्चित गर्नुहोस्।"
            }
        };
        return texts[this.currentLanguage][key] || texts.en[key];
    }

    getWelcomeMessage() {
        return this.getText('welcome');
    }

    getErrorMessage(error) {
        return this.getText('error_prefix') + error;
    }

    initializeDateTime() {
        this.updateDateTime();
        // Update time every second
        setInterval(() => this.updateDateTime(), 1000);
    }

    updateDateTime() {
        const now = new Date();
        const dateElement = document.getElementById('currentDate');
        const timeElement = document.getElementById('currentTime');
        
        if (dateElement && timeElement) {
            // Format date based on current language
            if (this.currentLanguage === 'ne') {
                // Nepali date format
                const nepaliDate = this.formatNepaliDate(now);
                dateElement.textContent = nepaliDate;
            } else {
                // English date format
                dateElement.textContent = now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
            // Format time
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }

    formatNepaliDate(date) {
        const weekdays = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'];
        const months = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];
        
        const weekday = weekdays[date.getDay()];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        
        return `${weekday}, ${month} ${day}, ${year}`;
    }
}

// Initialize Jarvis when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new JarvisAssistant();
});

// Add some helpful tips
console.log('Jarvis Voice Assistant loaded!');
console.log('🌍 Language Support: English & Nepali (नेपाली)');
console.log('🌐 Google Translate: Multiple languages supported');
console.log('📅 Date & Time: Real-time display with language support');
console.log('🎤 Wake words: "Jarvis" (English) or "जार्भिस" (Nepali)');
console.log('🗣️ Voice Commands:');
console.log('  - "What time is it?" / "कति बज्यो"');
console.log('  - "What date is it?" / "आज कुन मिति हो?"');
console.log('  - "Tell me a joke" / "चुट्किला सुनाउनुहोस्"');
console.log('Keyboard shortcuts:');
console.log('- Ctrl + M: Toggle microphone');
console.log('- Enter: Send text message');
console.log('- Click microphone button: Voice activation');
console.log('- Click language buttons to switch between English and Nepali');
console.log('- Use Google Translate dropdown for additional languages');

// Portfolio navigation function
function scrollToPortfolio() {
    const portfolioSection = document.querySelector('.portfolio-section');
    if (portfolioSection) {
        portfolioSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

async function checkBackendStatus() {
    const backendStatus = document.getElementById('backendStatus');
    try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
            backendStatus.classList.remove('offline');
            backendStatus.classList.add('online');
            backendStatus.title = 'Backend Connected';
        } else {
            throw new Error('Backend not responding');
        }
    } catch (error) {
        backendStatus.classList.remove('online');
        backendStatus.classList.add('offline');
        backendStatus.title = 'Backend Disconnected';
        console.error('Backend connection failed:', error);
    }
}

// Check backend status every 30 seconds
checkBackendStatus();
setInterval(checkBackendStatus, 30000);

async function sendMessage(message) {
    try {
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Update UI based on status
        if (data.status === 'fallback') {
            // Show fallback mode indicator
            document.getElementById('backendStatus').classList.add('fallback');
        }
        
        // Add message to conversation
        addMessageToChat(data.message, 'jarvis', data.timestamp);
        
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'jarvis');
    }
}

// Check backend status periodically
async function checkBackendStatus() {
    try {
        const response = await fetch('http://localhost:5000/status');
        const data = await response.json();
        
        const statusIndicator = document.getElementById('backendStatus');
        
        if (data.status === 'active') {
            statusIndicator.classList.remove('fallback');
            statusIndicator.classList.add('active');
            statusIndicator.title = 'AI Backend Active';
        } else {
            statusIndicator.classList.remove('active');
            statusIndicator.classList.add('fallback');
            statusIndicator.title = 'Running in Fallback Mode';
        }
    } catch (error) {
        console.error('Backend status check failed:', error);
    }
}

// Check status every 30 seconds
setInterval(checkBackendStatus, 30000);
checkBackendStatus(); // Initial check
