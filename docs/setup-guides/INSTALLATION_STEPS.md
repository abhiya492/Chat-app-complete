# 🚀 Quick Installation Steps for Google OAuth

Follow these steps to get Google OAuth working in your chat app:

---

## 1️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

This will install the new packages:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy

---

## 2️⃣ Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:5173` and `http://localhost:5001`
6. Add redirect URI: `http://localhost:5001/api/auth/google/callback`
7. Copy your Client ID and Client Secret

📖 **Detailed guide**: See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

---

## 3️⃣ Update Environment Variables

Add to your `backend/.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Client URL
CLIENT_URL=http://localhost:5173
```

---

## 4️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 5️⃣ Test It Out

1. Open browser: `http://localhost:5173`
2. Go to Login or Sign Up page
3. Click **"Continue with Google"**
4. Sign in with your Google account
5. You're in! 🎉

---

## ✅ What's Been Added

### Backend Files:
- ✅ `backend/src/lib/passport.js` - Passport configuration
- ✅ `backend/src/controllers/oauth.controller.js` - OAuth handlers
- ✅ `backend/src/routes/oauth.route.js` - OAuth routes
- ✅ `backend/src/models/user.model.js` - Updated with OAuth fields
- ✅ `backend/src/index.js` - Integrated passport middleware
- ✅ `backend/.env.example` - Environment template

### Frontend Files:
- ✅ `frontend/src/components/GoogleAuthButton.jsx` - Google button
- ✅ `frontend/src/pages/Login.jsx` - Added OAuth option
- ✅ `frontend/src/pages/SignUp.jsx` - Added OAuth option

### Documentation:
- ✅ `GOOGLE_OAUTH_SETUP.md` - Complete setup guide
- ✅ `README.md` - Updated with OAuth info

---

## 🔍 How It Works

```
User clicks "Continue with Google"
    ↓
Redirects to Google OAuth page
    ↓
User authenticates with Google
    ↓
Google redirects back with user data
    ↓
Backend creates/updates user in database
    ↓
Backend generates JWT token
    ↓
User is logged in! ✅
```

---

## 🐛 Common Issues

### "redirect_uri_mismatch"
- Make sure callback URL in Google Console matches exactly
- Include `http://` or `https://`
- No trailing slashes

### "Cannot find module 'passport'"
- Run `npm install` in backend folder

### User not logged in after redirect
- Check backend console for errors
- Verify all environment variables are set
- Check CORS configuration

---

## 📞 Need Help?

1. Check [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed guide
2. Review backend console logs
3. Check browser console for errors
4. Verify Google Cloud Console configuration

---

**🎉 That's it! Google OAuth is ready to use!**
