# 🚀 Groq API Setup (Llama 3) - Best Free AI

## Why Groq + Llama 3?

### ✅ Advantages
1. **FREE** - Generous free tier (14,400 requests/day)
2. **FASTEST** - 500+ tokens/second (10x faster than others)
3. **SMART** - Llama 3 8B model (GPT-3.5 level quality)
4. **NO CREDIT CARD** - Just email signup
5. **RELIABLE** - 99.9% uptime

### vs Other Options
- Hugging Face: Slow (20s first request), unreliable
- OpenAI: Paid only ($$$)
- Groq: **Fast, Free, Reliable** ✅

## Setup Steps (2 minutes)

### 1. Get Free API Key
```bash
1. Go to: https://console.groq.com
2. Sign up with email (no credit card)
3. Click "API Keys" in sidebar
4. Click "Create API Key"
5. Copy the key (starts with "gsk_...")
```

### 2. Add to .env
```bash
# Open backend/.env and add:
GROQ_API_KEY=gsk_your_key_here
```

### 3. Restart Backend
```bash
cd backend
npm run dev
```

### 4. Test Chatbot
```bash
1. Open app
2. Click Bot icon (bottom-right)
3. Ask: "Write a message to my boss for sick leave"
4. Get intelligent AI response!
```

## Features with Groq

### Smart Conversations
- **Context-aware**: Remembers last 6 messages
- **Natural language**: Understands intent
- **Task completion**: Can write emails, explain concepts, etc.

### Example Interactions

**Before (Rule-based):**
```
User: "write message to boss for leave"
Bot: "That's interesting! Tell me more."
```

**After (Groq Llama 3):**
```
User: "write message to boss for sick leave"
Bot: "Here's a professional message:

Subject: Sick Leave Request

Dear [Boss Name],

I'm writing to inform you that I'm feeling unwell today and need to take a sick leave. I'll keep you updated on my recovery and plan to return as soon as I'm better.

Thank you for your understanding.

Best regards,
[Your Name]"
```

## Performance

- **Response Time**: 0.5-2 seconds
- **Quality**: GPT-3.5 level
- **Rate Limit**: 14,400 requests/day (free)
- **Tokens/sec**: 500+ (fastest in industry)

## Free Tier Limits

```
Daily Requests: 14,400
Requests/minute: 30
Tokens/minute: 6,000
Models: llama3-8b-8192, llama3-70b-8192, mixtral-8x7b
```

## Fallback System

If Groq API fails or no key:
1. Smart pattern matching (write emails, jokes, time/date)
2. Randomized responses (no repetition)
3. User never sees errors

## Code Implementation

### Backend (ai.service.js)
```javascript
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY = process.env.GROQ_API_KEY;

async getChatbotResponse(userMessage, conversationHistory) {
  const messages = [
    { role: 'system', content: 'You are a helpful AI assistant...' },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
      temperature: 0.7,
      max_tokens: 200
    })
  });

  return response.choices[0].message.content;
}
```

## Testing

### Test Cases
```bash
1. "Write a professional email to my boss"
   ✅ Should generate proper email format

2. "Explain quantum computing in simple terms"
   ✅ Should give clear explanation

3. "Tell me a joke"
   ✅ Should generate new joke (not canned)

4. "What's 25 * 47?"
   ✅ Should calculate correctly

5. "Help me debug this code: [paste code]"
   ✅ Should provide debugging help
```

## Troubleshooting

### "AI unavailable, using smart rules"
- Check if GROQ_API_KEY is set in .env
- Verify key is valid at console.groq.com
- Check internet connection

### Slow responses
- First request may take 2-3s (model loading)
- Subsequent requests: <1s
- Check rate limits (30 req/min)

### Rate limit exceeded
- Free tier: 14,400/day
- Upgrade to paid for more (optional)
- Fallback system activates automatically

## Security

- ✅ API key stored in .env (not committed)
- ✅ Backend only (never exposed to frontend)
- ✅ Rate limiting handled by Groq
- ✅ No sensitive data sent to API

## Cost

**FREE FOREVER** (with limits)
- 14,400 requests/day
- No credit card required
- No expiration

**Paid (Optional)**
- $0.10 per 1M tokens (very cheap)
- Higher rate limits
- Priority support

## Next Steps

1. ✅ Get API key from console.groq.com
2. ✅ Add to backend/.env
3. ✅ Restart backend
4. ✅ Test chatbot
5. ✅ Enjoy intelligent AI! 🎉

---

**Get your free API key now:** https://console.groq.com

**Groq is the BEST free AI option for production apps!** 🚀
