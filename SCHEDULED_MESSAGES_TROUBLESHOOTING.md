# Scheduled Messages Troubleshooting Guide

## Issue: Feature works on localhost but not in production

### Root Cause
Production wasn't rebuilt after adding the scheduled messages feature. Production serves pre-built files from `frontend/dist`, which didn't include the new code.

### Solution Applied ✅

1. **Added logging** to backend for debugging:
   - Scheduler logs when it starts and finds messages
   - Message controller logs when scheduled messages are created
   - Scheduled message controller logs fetch operations

2. **Rebuilt frontend** with latest changes:
   ```bash
   cd frontend && npm run build
   ```

3. **Pushed to GitHub** with rebuilt dist files

### Next Steps for Production

#### If using Render/Railway/Heroku:
1. Go to your dashboard
2. Click "Manual Deploy" or wait for auto-deploy
3. Check logs for: `[SCHEDULER] Starting message scheduler...`

#### If using Vercel/Netlify (frontend only):
- Frontend will auto-deploy from GitHub
- Backend needs separate deployment

#### Verify It's Working:

1. **Check backend logs** for:
   ```
   [SCHEDULER] Starting message scheduler...
   Message scheduler started
   ```

2. **Test scheduled message**:
   - Click clock icon in message input
   - Schedule a message for 1 minute from now
   - Click "Scheduled" in navbar to see it listed
   - Wait 30-60 seconds for scheduler to send it

3. **Check logs** when message should send:
   ```
   [SCHEDULER] Found 1 messages to send
   [SCHEDULER] Sending message <id>
   [SCHEDULER] Message sent to <receiverId>
   ```

### Common Issues

#### 1. Scheduler not starting
**Symptom**: No `[SCHEDULER]` logs in backend
**Fix**: Restart backend server

#### 2. Messages not sending
**Symptom**: Messages stay in scheduled list forever
**Fix**: 
- Check MongoDB connection
- Verify `scheduledFor` date is in the past
- Check `isSent` field is `false`

#### 3. Frontend not showing scheduled button
**Symptom**: No clock icon in message input
**Fix**: Clear browser cache or hard refresh (Ctrl+Shift+R)

#### 4. API endpoint not found
**Symptom**: 404 error on `/api/messages/scheduled`
**Fix**: Verify backend routes are loaded (check `backend/src/index.js`)

### Manual Database Check

If messages aren't sending, check MongoDB:

```javascript
// In MongoDB shell or Compass
db.messages.find({ 
  isSent: false, 
  scheduledFor: { $ne: null } 
})
```

Should show your scheduled messages. If `scheduledFor` is in the past but `isSent` is still `false`, the scheduler isn't running.

### Force Rebuild Command

```bash
# From project root
cd frontend
rm -rf dist node_modules/.vite
npm run build
cd ..
git add .
git commit -m "fix: Force rebuild frontend"
git push origin main
```

### Environment Variables

Ensure these are set in production:
```env
MONGODB_URI=<your_mongodb_uri>
NODE_ENV=production
PORT=5001
```

### Logs to Monitor

**Backend startup:**
```
Server is running on port: 5001
MongoDB connected: <cluster>
Message scheduler started
[SCHEDULER] Starting message scheduler...
```

**When scheduling:**
```
[SCHEDULED] Creating scheduled message for 2024-01-15T10:30:00.000Z
[SCHEDULED] Message saved with ID <id>, scheduled for 2024-01-15T10:30:00.000Z
```

**When sending:**
```
[SCHEDULER] Found 1 messages to send
[SCHEDULER] Sending message <id>
[SCHEDULER] Message sent to <receiverId>
```

### Quick Test

1. Schedule message for 1 minute from now
2. Open browser console (F12)
3. Watch Network tab for `/api/messages/scheduled` calls
4. Should see message appear in list
5. After 1 minute, message should disappear and appear in chat

---

**Status**: ✅ Code pushed to GitHub with logging
**Next**: Redeploy on your hosting platform and monitor logs
