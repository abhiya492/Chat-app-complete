# ✅ Google OAuth Implementation Checklist

Use this checklist to ensure everything is set up correctly.

---

## 📦 1. Backend Setup

### Dependencies
- [ ] Run `cd backend && npm install`
- [ ] Verify `passport` is installed
- [ ] Verify `passport-google-oauth20` is installed

### Files Created
- [ ] `backend/src/lib/passport.js` exists
- [ ] `backend/src/controllers/oauth.controller.js` exists
- [ ] `backend/src/routes/oauth.route.js` exists
- [ ] `backend/.env.example` exists

### Files Modified
- [ ] `backend/src/models/user.model.js` has OAuth fields
- [ ] `backend/src/controllers/auth.controller.js` checks authProvider
- [ ] `backend/src/index.js` imports and uses passport
- [ ] `backend/package.json` has new dependencies

---

## 🌐 2. Google Cloud Console

### Project Setup
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 credentials

### OAuth Configuration
- [ ] Added authorized JavaScript origin: `http://localhost:5173`
- [ ] Added authorized JavaScript origin: `http://localhost:5001`
- [ ] Added redirect URI: `http://localhost:5001/api/auth/google/callback`
- [ ] Copied Client ID
- [ ] Copied Client Secret

### OAuth Consent Screen
- [ ] Configured app name
- [ ] Added user support email
- [ ] Added developer contact email
- [ ] Added test users (for development)

---

## ⚙️ 3. Environment Variables

### Backend .env File
- [ ] `GOOGLE_CLIENT_ID` is set
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] `GOOGLE_CALLBACK_URL` is set to `http://localhost:5001/api/auth/google/callback`
- [ ] `CLIENT_URL` is set to `http://localhost:5173`
- [ ] `JWT_SECRET` is set
- [ ] `MONGODB_URI` is set

### Verify No Typos
- [ ] No extra spaces in values
- [ ] No quotes around values
- [ ] Correct URLs with http:// or https://

---

## 🎨 4. Frontend Setup

### Files Created
- [ ] `frontend/src/components/GoogleAuthButton.jsx` exists

### Files Modified
- [ ] `frontend/src/pages/Login.jsx` imports GoogleAuthButton
- [ ] `frontend/src/pages/Login.jsx` renders GoogleAuthButton
- [ ] `frontend/src/pages/SignUp.jsx` imports GoogleAuthButton
- [ ] `frontend/src/pages/SignUp.jsx` renders GoogleAuthButton

### Dependencies
- [ ] `react-hot-toast` is available (for error messages)
- [ ] `react-router-dom` is available (for useSearchParams)

---

## 🗄️ 5. Database

### Schema Updates
- [ ] User model has `googleId` field
- [ ] User model has `authProvider` field
- [ ] User model has `isEmailVerified` field
- [ ] `password` field is now optional
- [ ] `googleId` has unique and sparse index

### Test Data
- [ ] Can create user with Google OAuth
- [ ] Can link Google to existing email account
- [ ] Password is not required for OAuth users

---

## 🚀 6. Running the Application

### Backend
- [ ] `cd backend && npm run dev` runs without errors
- [ ] Server starts on port 5001
- [ ] No passport configuration errors
- [ ] MongoDB connection successful

### Frontend
- [ ] `cd frontend && npm run dev` runs without errors
- [ ] App opens on port 5173
- [ ] Google button appears on login page
- [ ] Google button appears on signup page

---

## 🧪 7. Testing

### Basic Flow
- [ ] Click "Continue with Google" on login page
- [ ] Redirects to Google OAuth page
- [ ] Can select Google account
- [ ] Can grant permissions
- [ ] Redirects back to app
- [ ] User is logged in
- [ ] Profile picture from Google is displayed

### Account Linking
- [ ] Create account with email/password
- [ ] Logout
- [ ] Login with Google using same email
- [ ] Accounts are linked (same user ID)
- [ ] Can login with either method

### Error Handling
- [ ] Cancel Google auth → Shows error message
- [ ] Deny permissions → Shows error message
- [ ] Invalid credentials → Shows error message
- [ ] Network error → Graceful handling

### Edge Cases
- [ ] OAuth user cannot login with password
- [ ] Email user can link Google account
- [ ] Profile picture updates from Google
- [ ] Email is auto-verified for Google users

---

## 🔒 8. Security

### Configuration
- [ ] JWT_SECRET is strong and unique
- [ ] Cookies are HTTP-only
- [ ] Cookies have SameSite: strict
- [ ] CORS is configured correctly
- [ ] OAuth state parameter is used

### Production Readiness
- [ ] HTTPS in production
- [ ] Secure cookie flag in production
- [ ] Environment variables not in Git
- [ ] .env in .gitignore

---

## 📖 9. Documentation

### Files Created
- [ ] `GOOGLE_OAUTH_SETUP.md` exists
- [ ] `INSTALLATION_STEPS.md` exists
- [ ] `OAUTH_IMPLEMENTATION_SUMMARY.md` exists
- [ ] `OAUTH_QUICK_REFERENCE.md` exists
- [ ] `OAUTH_ARCHITECTURE.md` exists
- [ ] `OAUTH_CHECKLIST.md` exists (this file)

### README Updated
- [ ] README mentions Google OAuth
- [ ] README has OAuth in tech stack
- [ ] README has OAuth in features list
- [ ] README has OAuth environment variables

---

## 🐛 10. Troubleshooting

### Common Issues Checked
- [ ] No "redirect_uri_mismatch" error
- [ ] No "Cannot find module" errors
- [ ] No CORS errors
- [ ] No JWT errors
- [ ] No database connection errors

### Logs Verified
- [ ] Backend console shows no errors
- [ ] Frontend console shows no errors
- [ ] Network tab shows successful requests
- [ ] Cookies are being set correctly

---

## 🎯 11. User Experience

### UI/UX
- [ ] Google button has proper styling
- [ ] Google icon is displayed
- [ ] Button has hover effect
- [ ] Loading states work
- [ ] Error messages are user-friendly
- [ ] Success redirect is smooth

### Accessibility
- [ ] Button is keyboard accessible
- [ ] Button has proper ARIA labels
- [ ] Error messages are announced
- [ ] Focus management works

---

## 📊 12. Performance

### Optimization
- [ ] OAuth flow is fast (< 3 seconds)
- [ ] No unnecessary re-renders
- [ ] Images load quickly
- [ ] No memory leaks

### Monitoring
- [ ] Can track OAuth success rate
- [ ] Can track OAuth errors
- [ ] Can track user creation
- [ ] Can track account linking

---

## 🚢 13. Production Deployment

### Google Console (Production)
- [ ] Added production frontend URL to authorized origins
- [ ] Added production backend URL to authorized origins
- [ ] Added production callback URL to redirect URIs
- [ ] Published OAuth consent screen (if needed)

### Environment Variables (Production)
- [ ] `GOOGLE_CALLBACK_URL` updated for production
- [ ] `CLIENT_URL` updated for production
- [ ] `NODE_ENV` set to "production"
- [ ] All secrets are secure

### Testing (Production)
- [ ] OAuth works on production
- [ ] HTTPS is enforced
- [ ] Cookies work correctly
- [ ] No CORS issues

---

## ✅ Final Verification

### Complete Flow Test
1. [ ] Fresh user signs up with Google
2. [ ] User logs out
3. [ ] User logs in with Google
4. [ ] User profile is correct
5. [ ] User can access protected routes
6. [ ] User can logout
7. [ ] User can login again

### Code Quality
- [ ] No console.log statements in production
- [ ] No commented-out code
- [ ] Proper error handling
- [ ] Clean code structure
- [ ] Good variable names

### Documentation
- [ ] All guides are accurate
- [ ] All code has comments
- [ ] README is up to date
- [ ] API endpoints documented

---

## 🎉 Success Criteria

All checkboxes above should be checked ✅

### Minimum Requirements
- ✅ User can sign up with Google
- ✅ User can login with Google
- ✅ Profile picture from Google works
- ✅ Email is auto-verified
- ✅ JWT authentication works
- ✅ No security vulnerabilities

### Bonus Features
- ✅ Account linking works
- ✅ Error handling is robust
- ✅ UI is beautiful
- ✅ Documentation is complete
- ✅ Production ready

---

## 📞 Need Help?

If any checkbox is unchecked and you're stuck:

1. Check the error message in console
2. Review [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
3. Check [OAUTH_QUICK_REFERENCE.md](./OAUTH_QUICK_REFERENCE.md)
4. Verify environment variables
5. Check Google Cloud Console configuration

---

**🎊 Congratulations on completing Google OAuth integration!**

Next: Phase 2 (GitHub OAuth) or Phase 3 (Phone/OTP)
