# 🏗️ Google OAuth Architecture

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CHAT APPLICATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │    FRONTEND      │              │     BACKEND      │        │
│  │   (React.js)     │◄────────────►│   (Express.js)   │        │
│  │                  │   HTTP/WS    │                  │        │
│  │  Port: 5173      │              │   Port: 5001     │        │
│  └──────────────────┘              └──────────────────┘        │
│           │                                  │                  │
│           │                                  │                  │
│           ▼                                  ▼                  │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  GoogleAuthBtn   │              │   Passport.js    │        │
│  │  Component       │              │   + Strategies   │        │
│  └──────────────────┘              └──────────────────┘        │
│                                             │                   │
└─────────────────────────────────────────────┼───────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Google OAuth    │
                                    │  Provider        │
                                    └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │   MongoDB        │
                                    │   Database       │
                                    └──────────────────┘
```

---

## 🔄 Authentication Flow

### 1. User Initiates Login
```
┌──────────┐
│  User    │ Clicks "Continue with Google"
└────┬─────┘
     │
     ▼
┌─────────────────────────────────┐
│  Frontend (Login.jsx)           │
│  window.location.href =         │
│  '/api/auth/google'             │
└─────────────────────────────────┘
```

### 2. Backend Redirects to Google
```
┌─────────────────────────────────┐
│  Backend (oauth.route.js)       │
│  passport.authenticate('google')│
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Passport.js (passport.js)      │
│  Redirects to Google OAuth      │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Google OAuth Page              │
│  User signs in with Google      │
└─────────────────────────────────┘
```

### 3. Google Callback
```
┌─────────────────────────────────┐
│  Google OAuth                   │
│  Redirects with auth code       │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Backend Callback               │
│  /api/auth/google/callback      │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Passport Strategy              │
│  - Exchanges code for profile   │
│  - Checks if user exists        │
│  - Creates/updates user         │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  OAuth Controller               │
│  - Generates JWT token          │
│  - Sets HTTP-only cookie        │
│  - Redirects to frontend        │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Frontend Home Page             │
│  User is logged in! ✅          │
└─────────────────────────────────┘
```

---

## 📂 File Structure & Responsibilities

```
Chat-app-complete/
│
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── passport.js
│   │   │       ├── Configure Google Strategy
│   │   │       ├── Handle user lookup/creation
│   │   │       └── Serialize/deserialize user
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   │   └── Check authProvider in login
│   │   │   │
│   │   │   └── oauth.controller.js
│   │   │       ├── googleCallback()
│   │   │       └── googleAuthFailure()
│   │   │
│   │   ├── routes/
│   │   │   └── oauth.route.js
│   │   │       ├── GET /google
│   │   │       ├── GET /google/callback
│   │   │       └── GET /google/failure
│   │   │
│   │   ├── models/
│   │   │   └── user.model.js
│   │   │       ├── googleId field
│   │   │       ├── authProvider field
│   │   │       └── isEmailVerified field
│   │   │
│   │   └── index.js
│   │       └── Initialize passport middleware
│   │
│   └── .env
│       ├── GOOGLE_CLIENT_ID
│       ├── GOOGLE_CLIENT_SECRET
│       ├── GOOGLE_CALLBACK_URL
│       └── CLIENT_URL
│
└── frontend/
    └── src/
        ├── components/
        │   └── GoogleAuthButton.jsx
        │       └── Redirect to /api/auth/google
        │
        └── pages/
            ├── Login.jsx
            │   └── Include GoogleAuthButton
            │
            └── SignUp.jsx
                └── Include GoogleAuthButton
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: OAuth 2.0 Protocol                               │
│  ├── State parameter (CSRF protection)                     │
│  ├── Authorization code flow                               │
│  └── Secure token exchange                                 │
│                                                             │
│  Layer 2: HTTPS/TLS                                        │
│  ├── Encrypted communication                               │
│  └── Certificate validation                                │
│                                                             │
│  Layer 3: JWT Tokens                                       │
│  ├── Signed with secret key                                │
│  ├── 7-day expiration                                      │
│  └── Stateless authentication                              │
│                                                             │
│  Layer 4: HTTP-Only Cookies                                │
│  ├── XSS protection                                        │
│  ├── SameSite: strict                                      │
│  └── Secure flag in production                             │
│                                                             │
│  Layer 5: CORS Configuration                               │
│  ├── Allowed origins whitelist                             │
│  └── Credentials: true                                     │
│                                                             │
│  Layer 6: Database Security                                │
│  ├── Unique constraints                                    │
│  ├── Sparse indexes                                        │
│  └── No password storage for OAuth                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                        USER MODEL                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Existing Fields:                                          │
│  ├── _id: ObjectId                                         │
│  ├── fullName: String                                      │
│  ├── email: String (unique)                                │
│  ├── password: String (now optional)                       │
│  ├── profilePic: String                                    │
│  ├── bio: String                                           │
│  ├── status: String                                        │
│  ├── privacy: Object                                       │
│  ├── blockedUsers: [ObjectId]                              │
│  ├── resetPasswordOTP: String                              │
│  ├── resetPasswordExpires: Date                            │
│  ├── createdAt: Date                                       │
│  └── updatedAt: Date                                       │
│                                                             │
│  NEW OAuth Fields:                                         │
│  ├── googleId: String (unique, sparse)                     │
│  ├── authProvider: 'local' | 'google'                      │
│  └── isEmailVerified: Boolean                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Indexes:
- email: unique
- googleId: unique, sparse (allows null)
```

---

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION STATE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Zustand Store):                                 │
│  ├── authUser: User | null                                 │
│  ├── isLoggingIn: boolean                                  │
│  ├── isSigningUp: boolean                                  │
│  └── checkAuth()                                           │
│                                                             │
│  Backend (Session):                                        │
│  ├── JWT in HTTP-only cookie                               │
│  ├── Token contains: { userId }                            │
│  └── Verified by protectRoute middleware                   │
│                                                             │
│  Database (Persistent):                                    │
│  ├── User document with all fields                         │
│  └── authProvider tracks login method                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Network Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Browser  │────►│ Frontend │────►│ Backend  │────►│  Google  │
│          │     │ :5173    │     │ :5001    │     │  OAuth   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     ▲                                   │                │
     │                                   ▼                │
     │                            ┌──────────┐           │
     │                            │ MongoDB  │           │
     │                            │ Database │           │
     │                            └──────────┘           │
     │                                   │                │
     │                                   ▼                │
     └───────────────────────────────────┴────────────────┘
                    (Redirect with JWT cookie)

Request Flow:
1. GET  /api/auth/google
2. 302  Redirect to Google
3. User authenticates
4. 302  Redirect to /api/auth/google/callback
5. POST Create/update user in DB
6. 302  Redirect to frontend with cookie
```

---

## 🎨 Component Hierarchy

```
App.jsx
│
├── Router
│   │
│   ├── Login.jsx
│   │   ├── AuthImagePattern
│   │   ├── GoogleAuthButton ◄── NEW
│   │   └── LoginForm
│   │
│   ├── SignUp.jsx
│   │   ├── AuthImagePattern
│   │   ├── GoogleAuthButton ◄── NEW
│   │   └── SignUpForm
│   │
│   └── Home.jsx
│       └── (Protected Route)
│
└── Providers
    ├── AuthStore (Zustand)
    └── Toast (react-hot-toast)
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA FLOW                              │
└─────────────────────────────────────────────────────────────┘

User Action:
    │
    ├─► Click "Continue with Google"
    │
    ▼
Frontend:
    │
    ├─► window.location.href = '/api/auth/google'
    │
    ▼
Backend (Route):
    │
    ├─► passport.authenticate('google')
    │
    ▼
Passport Strategy:
    │
    ├─► Redirect to Google OAuth
    │
    ▼
Google:
    │
    ├─► User authenticates
    ├─► Returns authorization code
    │
    ▼
Backend (Callback):
    │
    ├─► Exchange code for user profile
    ├─► profile = { id, email, name, photo }
    │
    ▼
Database Logic:
    │
    ├─► Check if googleId exists
    │   ├─► Yes: Return existing user
    │   └─► No: Check if email exists
    │       ├─► Yes: Link Google to account
    │       └─► No: Create new user
    │
    ▼
JWT Generation:
    │
    ├─► Generate token with userId
    ├─► Set HTTP-only cookie
    │
    ▼
Redirect:
    │
    ├─► Redirect to CLIENT_URL
    │
    ▼
Frontend:
    │
    ├─► Cookie automatically sent
    ├─► checkAuth() validates user
    ├─► Update authStore
    │
    ▼
User Logged In ✅
```

---

## 🔧 Configuration Matrix

| Environment | Frontend URL | Backend URL | Callback URL |
|------------|--------------|-------------|--------------|
| Development | http://localhost:5173 | http://localhost:5001 | http://localhost:5001/api/auth/google/callback |
| Production | https://app.com | https://api.app.com | https://api.app.com/api/auth/google/callback |

---

## 🎯 Key Design Decisions

### 1. Why Passport.js?
- ✅ Industry standard
- ✅ Multiple strategies support
- ✅ Well-documented
- ✅ Active maintenance

### 2. Why JWT in Cookies?
- ✅ XSS protection (HTTP-only)
- ✅ CSRF protection (SameSite)
- ✅ Automatic sending
- ✅ Works with existing auth

### 3. Why Account Linking?
- ✅ Prevents duplicate accounts
- ✅ Better user experience
- ✅ Unified user data
- ✅ Flexible authentication

### 4. Why Optional Password?
- ✅ OAuth users don't need it
- ✅ Cleaner data model
- ✅ Security best practice
- ✅ Prevents confusion

---

## 📈 Scalability Considerations

```
Current: Single Server
┌──────────────┐
│   Server     │
│  (Express)   │
└──────────────┘

Future: Load Balanced
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
┌──▼───┐ ┌─▼────┐ ┌─▼────┐ │
│Server│ │Server│ │Server│ │
│  1   │ │  2   │ │  3   │ │
└──────┘ └──────┘ └──────┘ │
                            │
                    ┌───────▼────┐
                    │  MongoDB   │
                    │  Cluster   │
                    └────────────┘

JWT tokens work seamlessly across servers!
```

---

**🎉 Architecture Complete!**

This architecture supports:
- ✅ Multiple authentication methods
- ✅ Horizontal scaling
- ✅ High security
- ✅ Great user experience
- ✅ Easy maintenance
