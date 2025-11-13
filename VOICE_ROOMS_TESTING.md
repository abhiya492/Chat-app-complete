# 🧪 Voice Rooms - Testing Guide

## Quick Test (5 minutes)

### 1. Start the App
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Create a Room
1. Login to your account
2. Click "Rooms" in navbar
3. Click "Create Room"
4. Fill in:
   - Title: "Test Room"
   - Category: "Tech"
5. Click "Create Room"

### 3. Test as Host
- You should see the room view
- Click microphone icon (allow mic access)
- Speak - you should see speaking indicator
- Click mute/unmute

### 4. Test with Second User
1. Open incognito window
2. Login with different account
3. Go to /rooms
4. Join the test room
5. Click "Raise Hand" button
6. In first window (host), click "Promote"
7. Second user should now be able to speak
8. Both users should hear each other

## Expected Behavior

### ✅ Working
- Room creation
- Room listing
- Join/leave room
- Participant list updates
- Hand raise/lower
- Promote/demote
- Microphone access
- Mute/unmute
- WebRTC peer connections
- Audio streaming between speakers
- **Speaking indicators** (animated bars + ring effects)
- Real-time voice activity detection

### 🐛 Known Issues
- Participant names show as userId (need to populate user data)
- No connection quality indicator
- Server restart loses active rooms (in-memory)

## Browser Compatibility

### ✅ Supported
- Chrome 90+
- Firefox 88+
- Safari 14.3+ (iOS/macOS)
- Edge 90+

### ❌ Not Supported
- IE 11
- Safari < 14.3
- Chrome < 90

## Troubleshooting

### "Microphone permission denied"
- Check browser permissions
- Ensure HTTPS (or localhost)
- Try different browser

### "Can't hear other person"
- Check both users are speakers
- Check mute status
- Check browser audio output
- Open browser console for WebRTC errors

### "Room not found"
- Server may have restarted (in-memory storage)
- Create a new room

### "Connection failed"
- Check internet connection
- May need TURN server for strict NAT
- Check browser console for ICE errors

## Performance Metrics

### Target
- Room join: < 500ms
- WebRTC connection: < 2s
- Audio latency: < 300ms

### Monitor
```javascript
// In browser console
console.log('Active rooms:', activeRooms.size);
console.log('Participants:', participants.length);
```

## Next Steps

1. ✅ Basic functionality working
2. 🔄 Add user data population
3. 🔄 Add speaking indicators
4. 🔄 Add connection quality
5. 🔄 Add room analytics
6. 🔄 Add mobile optimization

## Production Checklist

- [ ] Test with 6 speakers
- [ ] Test with 20 participants
- [ ] Test on mobile browsers
- [ ] Test with poor network
- [ ] Test reconnection after disconnect
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add analytics tracking
- [ ] Setup monitoring

