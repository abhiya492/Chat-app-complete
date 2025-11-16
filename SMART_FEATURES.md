# Smart Notifications & Call Quality Indicator

## Overview
Two new intelligent features to enhance user experience: Smart Notifications that filter important messages and Call Quality Indicator that shows network status before calls.

---

## 1. Smart Notifications 🔔

### Features
- **Intelligent filtering** - Only notifies for important messages
- **Customizable preferences** - User controls what's important
- **Keyword detection** - Recognizes urgent words
- **Question detection** - Notifies for questions
- **Media detection** - Alerts for images, videos, files
- **@Mention detection** - Notifies when mentioned
- **Short message priority** - Brief messages get attention

### How It Works

#### Detection Logic
Messages are analyzed for:
- **Important keywords**: urgent, important, asap, emergency, help, please, need, call me, meeting, deadline, today, now
- **Questions**: Contains ?, what, when, where, who, why, how, can you, could you, would you
- **Media**: Has image, video, voice, or file attachment
- **@Mentions**: Contains @ symbol
- **Short messages**: 20 characters or less

#### User Preferences
Users can toggle in Settings:
- ✅ Notify for all messages (overrides all)
- ✅ Notify for @mentions
- ✅ Notify for questions
- ✅ Notify for important keywords
- ✅ Notify for media messages

### Implementation

**Files Created:**
- `frontend/src/lib/smartNotifications.js` - Filter logic

**Files Modified:**
- `frontend/src/store/useChatStore.js` - Apply filter to notifications
- `frontend/src/pages/Setting.jsx` - Notification preferences UI

### Usage

#### In Settings
1. Go to Settings page
2. Find "Smart Notifications" section
3. Toggle preferences:
   - Turn ON "Notify for all messages" to get all notifications
   - Or customize individual filters
4. Preferences saved in localStorage

#### How Notifications Work
- When message received and app is hidden
- Message analyzed by `isImportantMessage()`
- If important (based on preferences), notification shown
- Otherwise, silently received

### Examples

**Will Notify:**
- "Can you call me ASAP?" (question + keyword)
- "Meeting at 3pm today" (keywords)
- "Help!" (keyword + short)
- [Image sent] (media)
- "@John are you there?" (mention + question)

**Won't Notify (default):**
- "ok"
- "lol"
- "I'm eating lunch"
- "Just got home"

### Benefits
- ✅ Reduces notification fatigue
- ✅ Focuses on important messages
- ✅ User-controlled filtering
- ✅ No missed urgent messages
- ✅ Better user experience

---

## 2. Call Quality Indicator 📶

### Features
- **Pre-call network check** - Test before calling
- **Connection type detection** - Shows 2G/3G/4G
- **Latency measurement** - Ping test to server
- **Speed detection** - Download speed in Mbps
- **Visual quality indicator** - Color-coded status
- **Proceed or cancel** - User decides to call

### How It Works

#### Network Detection
Uses multiple methods:
1. **Navigator.connection API** - Gets connection type and speed
2. **Ping test** - Measures latency to server
3. **Quality calculation** - Combines metrics

#### Quality Levels
- **Good** (Green): 4G, <150ms latency - Excellent for calls
- **Fair** (Yellow): 3G, 150-300ms latency - Calls may have issues
- **Poor** (Red): 2G, >300ms latency - Calls not recommended

### Implementation

**Files Created:**
- `frontend/src/lib/networkQuality.js` - Network detection logic
- `frontend/src/components/CallQualityIndicator.jsx` - Modal component

**Files Modified:**
- `frontend/src/components/ChatHeader.jsx` - Show indicator before calls
- `frontend/src/pages/RandomChat.jsx` - Show indicator before random chat

### Usage

#### Before Voice/Video Call
1. Click voice or video call button
2. Quality indicator modal appears
3. Shows:
   - Connection type (2G/3G/4G)
   - Latency (ms)
   - Download speed (Mbps)
   - Quality rating with color
4. User can:
   - "Start Call" if quality good
   - "Call Anyway" if quality poor
   - "Cancel" to not call

#### Before Random Chat
1. Click "Start Chatting"
2. Quality check runs automatically
3. Shows network status
4. Proceed or cancel

### Technical Details

#### Network Quality Check
```javascript
checkNetworkQuality()
- Checks navigator.connection
- Pings /health endpoint
- Calculates latency
- Returns quality + details
```

#### Quality Calculation
- **Connection type**: 2G/3G/4G from navigator.connection
- **Latency**: Time to ping server
- **Combined score**: Worst of both metrics

#### Fallback
- If APIs unavailable, shows "Checking..."
- Allows user to proceed anyway
- Graceful degradation

### Benefits
- ✅ Prevents poor call experiences
- ✅ Sets user expectations
- ✅ Reduces failed calls
- ✅ Shows technical details
- ✅ User stays informed

---

## Configuration

### Smart Notifications
Preferences stored in `localStorage`:
```javascript
{
  notifyAll: false,
  notifyMentions: true,
  notifyQuestions: true,
  notifyKeywords: true,
  notifyMedia: true
}
```

### Call Quality
No configuration needed - automatic detection

---

## Browser Support

### Smart Notifications
- ✅ All modern browsers
- ✅ localStorage required
- ✅ Notification API required

### Call Quality Indicator
- ✅ Chrome/Edge (full support)
- ⚠️ Firefox (partial - no connection API)
- ⚠️ Safari (partial - no connection API)
- ✅ Fallback to ping test only

---

## Future Enhancements

### Smart Notifications
- [ ] AI-powered importance detection
- [ ] Learn from user behavior
- [ ] Priority levels (high/medium/low)
- [ ] Scheduled quiet hours
- [ ] Per-contact preferences

### Call Quality
- [ ] Bandwidth test
- [ ] Packet loss detection
- [ ] Jitter measurement
- [ ] Historical quality tracking
- [ ] Automatic quality adjustment

---

## Testing

### Test Smart Notifications
1. Go to Settings
2. Toggle different preferences
3. Send test messages:
   - "urgent help needed"
   - "what time is it?"
   - Send an image
   - "hello"
4. Check which trigger notifications

### Test Call Quality
1. Click call button
2. Check indicator shows
3. Verify metrics displayed
4. Test on different networks:
   - WiFi
   - 4G
   - 3G (if available)
5. Verify color coding

---

## Notes
- Smart notifications reduce spam
- Call quality prevents bad experiences
- Both features enhance UX
- Minimal performance impact
- User-friendly and intuitive
