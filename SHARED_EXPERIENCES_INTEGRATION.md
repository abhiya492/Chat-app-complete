# 🎮 Shared Experiences - Integration Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install react-youtube
```

### 2. Add to Chat Interface

Update `frontend/src/components/messages/MessageContainer.jsx`:

```jsx
import SharedExperiencePanel from "../SharedExperiences/SharedExperiencePanel";

// Add this inside the component JSX:
<div className="flex h-full">
  {/* Existing chat content */}
  <div className="flex-1">
    {/* Your existing MessageContainer content */}
  </div>
  
  {/* New shared experiences panel */}
  <div className="w-80">
    <SharedExperiencePanel />
  </div>
</div>
```

### 3. Add YouTube API Script

Add to `frontend/index.html`:
```html
<script src="https://www.youtube.com/iframe_api"></script>
```

### 4. Environment Variables

Add to `backend/.env`:
```bash
# Optional - for enhanced features
YOUTUBE_API_KEY=your_youtube_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
```

---

## ✅ Test Features

### Watch Together
1. Open chat with a friend
2. Click "📺 Watch" tab
3. Paste YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. Click "Start" - video syncs for both users

### Mini Games
1. Click "🎮 Games" tab  
2. Click "🎯 Tic-Tac-Toe"
3. Make moves - updates in real-time

### Cursor Share
1. Click "👆 Cursor" tab
2. Click "Start Sharing"
3. Move mouse - others see your cursor

---

## 🎯 Success Metrics

**MVP Complete When:**
- ✅ YouTube videos sync between 2+ users
- ✅ Tic-tac-toe works end-to-end
- ✅ Cursors show with <200ms latency
- ✅ No console errors
- ✅ Mobile responsive

**Production Ready When:**
- ✅ 10+ concurrent sessions
- ✅ Error handling for network issues
- ✅ Analytics tracking
- ✅ Performance optimized

---

## 🐛 Troubleshooting

### YouTube not loading?
- Check HTTPS (required for iframe API)
- Verify CORS settings
- Check browser console for errors

### Cursor sharing laggy?
- Reduce throttle rate in CursorShare.jsx
- Check network latency
- Verify socket connection

### Games not syncing?
- Check socket events in browser dev tools
- Verify MongoDB connection
- Check user permissions

---

## 🚀 Next Steps

1. **Test with friends** - Get real user feedback
2. **Add more games** - Chess, trivia, drawing
3. **Spotify integration** - Shared music listening
4. **Screen sharing** - Collaborative browsing
5. **Analytics** - Track usage patterns

Ready to launch! 🎉