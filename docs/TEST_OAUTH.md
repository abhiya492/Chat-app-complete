# OAuth Testing Guide

## Current Configuration Status

### ✅ Code Changes (All Complete)
1. Cookie sameSite: "lax" ✓
2. Socket.IO CORS includes production URL ✓
3. OAuth buttons use full backend URL ✓
4. API routes before static files ✓
5. Simplified OAuth login check ✓

### 🔍 Test Locally First

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Visit: http://localhost:5173
Click "Continue with Google" → Should work

### 🚀 Production Test

1. **Verify Render Environment Variables:**
   ```
   CLIENT_URL=https://chat-app-complete.onrender.com
   GOOGLE_CALLBACK_URL=https://chat-app-complete.onrender.com/api/auth/google/callback
   GITHUB_CALLBACK_URL=https://chat-app-complete.onrender.com/api/auth/github/callback
   NODE_ENV=production
   ```

2. **Verify Google Console:**
   - Authorized JavaScript origins: `https://chat-app-complete.onrender.com`
   - Authorized redirect URIs: `https://chat-app-complete.onrender.com/api/auth/google/callback`

3. **Verify GitHub OAuth:**
   - Authorization callback URL: `https://chat-app-complete.onrender.com/api/auth/github/callback`

4. **Test Flow:**
   - Open: https://chat-app-complete.onrender.com
   - Open DevTools → Network tab
   - Click "Continue with Google"
   - Should see:
     - Request to: `https://chat-app-complete.onrender.com/api/auth/google`
     - Redirect to Google
     - Redirect back to: `https://chat-app-complete.onrender.com/api/auth/google/callback`
     - Final redirect to: `https://chat-app-complete.onrender.com`
     - User logged in

5. **Check Render Logs:**
   ```
   OAuth callback - User: [user_id]
   OAuth callback - CLIENT_URL: https://chat-app-complete.onrender.com
   OAuth callback - Token generated: true
   ```

## Common Issues

### Issue: "No routes matched location /api/auth/google"
**Cause:** Frontend build not deployed
**Fix:** Render should auto-build, or manually: `cd frontend && npm run build`

### Issue: 401 Unauthorized after redirect
**Cause:** Cookie not set (sameSite issue or CORS)
**Fix:** Already fixed with sameSite: "lax"

### Issue: Redirect to localhost instead of production
**Cause:** CLIENT_URL not set in Render
**Fix:** Set CLIENT_URL environment variable

### Issue: Google OAuth error "redirect_uri_mismatch"
**Cause:** Google Console doesn't have production URL
**Fix:** Add production callback URL to Google Console

## Debug Commands

```bash
# Check if environment variables are set in Render
# Go to Render Dashboard → Service → Environment

# Check Render logs
# Go to Render Dashboard → Service → Logs

# Test OAuth endpoint directly
curl https://chat-app-complete.onrender.com/api/auth/google
# Should redirect to Google
```

## Expected Behavior

### First Time Login:
1. Click "Continue with Google"
2. Redirect to Google login
3. Select account
4. Redirect back to app
5. User created in database
6. Cookie set
7. Logged in

### Second Time Login:
1. Click "Continue with Google"
2. Redirect to Google (may auto-select account)
3. Redirect back to app
4. User found in database
5. Cookie set
6. Logged in

## If Still Not Working

The issue is NOT in the code. It's one of:
1. Render environment variables not saved
2. Google/GitHub console URLs not updated
3. Browser cache (try incognito mode)
4. Render not finished deploying (wait 2-3 minutes)
