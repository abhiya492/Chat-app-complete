# 🚀 Google OAuth - Quick Reference Card

## 📦 Installation
```bash
cd backend && npm install
```

## 🔑 Environment Variables
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

## 🌐 Google Console URLs
- **Authorized Origins**: `http://localhost:5173`, `http://localhost:5001`
- **Redirect URI**: `http://localhost:5001/api/auth/google/callback`

## 🛣️ API Routes
```
GET  /api/auth/google           → Start OAuth
GET  /api/auth/google/callback  → Handle callback
GET  /api/auth/google/failure   → Handle errors
```

## 📁 New Files
```
backend/src/lib/passport.js
backend/src/controllers/oauth.controller.js
backend/src/routes/oauth.route.js
frontend/src/components/GoogleAuthButton.jsx
```

## 🗄️ Database Fields
```javascript
googleId: String
authProvider: 'local' | 'google'
isEmailVerified: Boolean
password: Optional
```

## 🎨 Frontend Usage
```jsx
import GoogleAuthButton from '../components/GoogleAuthButton';

<GoogleAuthButton />
```

## 🧪 Test Flow
1. Click "Continue with Google"
2. Sign in with Google
3. Redirect to home
4. Check logged in ✅

## 🐛 Quick Fixes
- **redirect_uri_mismatch**: Check Google Console URLs
- **Module not found**: Run `npm install`
- **Not logged in**: Check JWT_SECRET and cookies
- **CORS error**: Verify CLIENT_URL

## 📖 Full Guides
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- [INSTALLATION_STEPS.md](./INSTALLATION_STEPS.md)
- [OAUTH_IMPLEMENTATION_SUMMARY.md](./OAUTH_IMPLEMENTATION_SUMMARY.md)

---

**⚡ Quick Start**: Get credentials → Add to .env → npm install → npm run dev
