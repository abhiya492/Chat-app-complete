// Free AI service using Groq API (Llama 3)
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY = process.env.GROQ_API_KEY || '';

export const aiService = {
  async generateSmartReplies(messageText) {
    return this.getFallbackReplies(messageText);
  },

  async translateMessage(text, targetLang = 'en') {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`;
      const res = await fetch(url);
      const data = await res.json();
      
      return { 
        translated: data.responseData.translatedText, 
        detectedLang: data.responseData.match?.split('-')[0] || 'unknown' 
      };
    } catch (error) {
      return { translated: text, detectedLang: 'unknown' };
    }
  },

  async detectSpam(text) {
    const spamWords = ['click here', 'buy now', 'limited offer', 'winner', 'free money', 'congratulations'];
    const isSpam = spamWords.some(word => text.toLowerCase().includes(word));
    return { isSpam, confidence: isSpam ? 0.8 : 0.1, reason: isSpam ? 'Spam keywords detected' : 'Clean' };
  },

  async moderateContent(text) {
    const badWords = ['hate', 'kill', 'violence', 'abuse'];
    const flagged = badWords.some(word => text.toLowerCase().includes(word));
    return { flagged, categories: { hate: flagged }, scores: { hate: flagged ? 0.8 : 0.1 } };
  },

  async analyzeSentiment(text) {
    return this.basicSentiment(text);
  },
  
  basicSentiment(text) {
    const positive = ['good', 'great', 'love', 'happy', 'excellent', '😊', '❤️', '👍'];
    const negative = ['bad', 'hate', 'sad', 'angry', 'terrible', '😢', '😠'];
    
    const hasPositive = positive.some(w => text.toLowerCase().includes(w));
    const hasNegative = negative.some(w => text.toLowerCase().includes(w));
    
    if (hasPositive && !hasNegative) return { sentiment: 'positive', score: 0.8 };
    if (hasNegative && !hasPositive) return { sentiment: 'negative', score: 0.8 };
    return { sentiment: 'neutral', score: 0.5 };
  },

  async getChatbotResponse(userMessage, conversationHistory = []) {
    // Try Groq API (Llama 3) - Fast and Smart
    if (GROQ_KEY) {
      try {
        const messages = [
          { role: 'system', content: 'You are a helpful, friendly AI assistant in a chat app. Be concise (max 100 words), natural, and helpful.' },
          ...conversationHistory.slice(-6).map(m => ({
            role: m.role === 'bot' ? 'assistant' : 'user',
            content: m.text
          })),
          { role: 'user', content: userMessage }
        ];

        const response = await fetch(GROQ_API, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages,
            temperature: 0.7,
            max_tokens: 200
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0]?.message?.content?.trim() || this.getSmartResponse(userMessage, conversationHistory);
        }
      } catch (error) {
        console.log('Groq API error, using fallback');
      }
    }
    
    // Fallback to smart rules
    return this.getSmartResponse(userMessage, conversationHistory) || this.getRuleBasedResponse(userMessage);
  },
  
  getSmartResponse(userMessage, history = []) {
    const lower = userMessage.toLowerCase();
    const words = lower.split(' ');
    
    // Greetings
    if (/\b(hello|hi|hey|greetings)\b/.test(lower)) {
      const greetings = ["Hey! What's on your mind?", "Hi there! How can I assist?", "Hello! What can I do for you?"];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Questions about capabilities
    if (/\b(what can you|what do you|who are you|your name)\b/.test(lower)) {
      return "I'm an AI assistant that can help with questions, write messages, tell jokes, and have conversations. What would you like to do?";
    }
    
    // Writing requests
    if (/\b(write|draft|compose|create)\b/.test(lower) && /\b(message|email|letter|text)\b/.test(lower)) {
      if (/\b(boss|manager|supervisor)\b/.test(lower) && /\b(leave|sick|absent)\b/.test(lower)) {
        return "Here's a professional message:\n\nDear [Boss Name],\n\nI'm writing to inform you that I'm feeling unwell and need to take a sick leave today. I'll keep you updated on my recovery and return as soon as possible.\n\nThank you for understanding.\nBest regards";
      }
      return "I can help you write that! Could you give me more details about what you need? For example: who it's for, the purpose, and any key points to include.";
    }
    
    // Jokes
    if (/\b(joke|funny|laugh)\b/.test(lower)) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "Why did the developer quit? They didn't get arrays! 😄",
        "What's a programmer's favorite hangout? The Foo Bar! 🍺",
        "Why do Java developers wear glasses? Because they can't C#! 👓"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Time/Date
    if (/\b(time|clock)\b/.test(lower)) return `It's ${new Date().toLocaleTimeString()} right now.`;
    if (/\b(date|today|day)\b/.test(lower)) return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    
    // Gratitude
    if (/\b(thank|thanks|thx)\b/.test(lower)) return "You're very welcome! Happy to help anytime! 😊";
    
    // Farewell
    if (/\b(bye|goodbye|see you|later)\b/.test(lower)) return "Goodbye! Feel free to come back anytime. Have a great day! 👋";
    
    // How are you
    if (/\bhow are you\b/.test(lower)) return "I'm doing great, thanks for asking! How about you? How can I help today?";
    
    return null; // No match, try AI
  },
  
  getRuleBasedResponse(userMessage) {
    const responses = [
      "That's interesting! Could you tell me more about that?",
      "I see. What else would you like to know?",
      "Interesting point! How can I help you with that?",
      "Got it! What would you like to do next?",
      "I understand. Is there something specific I can help you with?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  getFallbackReplies(text) {
    const lower = text.toLowerCase();
    if (lower.includes('?')) return ["Yes", "No", "Maybe"];
    if (lower.includes('thanks')) return ["You're welcome!", "No problem!", "Anytime!"];
    if (lower.includes('hello') || lower.includes('hi')) return ["Hey!", "Hello!", "Hi there!"];
    return ["Got it", "Okay", "Sure"];
  }
};
