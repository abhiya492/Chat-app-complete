# 🔐 Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your chat application.

---

## 📋 Prerequisites

- Google Account
- Your application running locally or deployed

---

## 🚀 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Chat App` (or your preferred name)
4. Click **"Create"**

---

## 🔧 Step 2: Enable Google+ API

1. In your project dashboard, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

---

## 🔑 Step 3: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: `Chat App`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"**
   - Scopes: Click **"Save and Continue"** (default scopes are fine)
   - Test users: Add your email for testing
   - Click **"Save and Continue"**

4. Back to **"Create OAuth client ID"**:
   - Application type: **Web application**
   - Name: `Chat App Web Client`
   
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5001
   ```
   
6. **Authorized redirect URIs**:
   ```
   http://localhost:5001/api/auth/google/callback
   ```

7. Click **"Create"**

8. **Copy your credentials**:
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxx`

---

## ⚙️ Step 4: Configure Environment Variables

1. Open `/backend/.env` file
2. Add the following variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Client URL (Frontend)
CLIENT_URL=http://localhost:5173
```

---

## 📦 Step 5: Install Dependencies

```bash
cd backend
npm install
```

This will install the new dependencies:
- `passport`
- `passport-google-oauth20`

---

## 🏃 Step 6: Run the Application

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser: `http://localhost:5173`

---

## ✅ Step 7: Test Google OAuth

1. Go to **Login** or **Sign Up** page
2. Click **"Continue with Google"** button
3. Select your Google account
4. Grant permissions
5. You should be redirected back and logged in! 🎉

---

## 🌐 Production Deployment

When deploying to production (e.g., Render, Heroku, Vercel):

1. **Update Google Cloud Console**:
   - Add production URLs to **Authorized JavaScript origins**:
     ```
     https://your-app.com
     https://your-api.com
     ```
   
   - Add production callback to **Authorized redirect URIs**:
     ```
     https://your-api.com/api/auth/google/callback
     ```

2. **Update Environment Variables**:
   ```env
   GOOGLE_CALLBACK_URL=https://your-api.com/api/auth/google/callback
   CLIENT_URL=https://your-app.com
   ```

3. **Publish OAuth App**:
   - Go to **OAuth consent screen**
   - Click **"Publish App"**
   - Submit for verification (if needed)

---

## 🔒 Security Best Practices

1. **Never commit** `.env` file to Git
2. **Keep Client Secret** secure
3. **Use HTTPS** in production
4. **Limit scopes** to only what you need (profile, email)
5. **Regularly rotate** credentials

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that callback URL in Google Console matches exactly
- Include protocol (http/https)
- No trailing slashes

### Error: "Access blocked: This app's request is invalid"
- Configure OAuth consent screen
- Add test users in development mode

### Error: "Invalid credentials"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check for extra spaces or quotes

### User redirected but not logged in
- Check backend logs for errors
- Verify JWT_SECRET is set
- Check CORS configuration

---

## 📊 What Happens Behind the Scenes

1. User clicks "Continue with Google"
2. Frontend redirects to: `http://localhost:5001/api/auth/google`
3. Backend redirects to Google OAuth page
4. User authenticates with Google
5. Google redirects back to: `http://localhost:5001/api/auth/google/callback`
6. Backend receives user profile from Google
7. Backend creates/updates user in database
8. Backend generates JWT token
9. Backend redirects to frontend with cookie
10. User is logged in! ✅

---

## 🎯 Features Implemented

- ✅ Google OAuth login
- ✅ Google OAuth signup
- ✅ Auto-create user account
- ✅ Link existing email accounts
- ✅ Profile picture from Google
- ✅ Email verification (auto-verified)
- ✅ Seamless JWT integration
- ✅ Error handling
- ✅ Beautiful UI button

---

## 📝 Database Changes

New fields added to User model:
- `googleId`: Unique Google user ID
- `authProvider`: 'local' or 'google'
- `isEmailVerified`: Auto-true for Google users
- `password`: Now optional (not required for OAuth)

---

## 🎨 UI Components

- `GoogleAuthButton.jsx`: Reusable Google sign-in button
- Updated `Login.jsx`: Added Google OAuth option
- Updated `SignUp.jsx`: Added Google OAuth option

---

## 🔄 Account Linking

If a user signs up with email, then later tries Google OAuth with the same email:
- ✅ Accounts are automatically linked
- ✅ User can login with either method
- ✅ Profile picture updated from Google (if not set)

---

## 📞 Support

If you encounter issues:
1. Check backend console logs
2. Check browser console
3. Verify all environment variables
4. Ensure Google Cloud project is configured correctly

---

**🎉 Congratulations! Google OAuth is now set up!**

Next steps:
- Phase 2: GitHub OAuth
- Phase 3: Phone/OTP Authentication
